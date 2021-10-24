import { AsyncResource } from "async_hooks";
import { EventEmitter } from "events";
import { Worker, WorkerOptions } from "worker_threads";

const taskInfo = Symbol("kTaskInfo");
const freeWorkerEvent = Symbol("kFreeWorkerEvent");

export class WorkerPoolTaskInfo extends AsyncResource {
  public callback: (...args: any[]) => void;

  constructor(callback: (...args: any[]) => void) {
    super("WorkerPoolTaskInfo");
    this.callback = callback;
  }

  done(err: any, result: any) {
    this.runInAsyncScope(this.callback, null, err, result);
    this.emitDestroy();
  }
}

interface IWorkerConfig {
  path: string;
  options?: WorkerOptions;
}

export class WorkerPool extends EventEmitter {
  public threads: number;
  public workerConfig: IWorkerConfig;
  public workers: Worker[];
  public freeWorkers: Worker[];

  constructor(threads: number, workerConfig: IWorkerConfig) {
    super();
    this.threads = threads;
    this.workerConfig = workerConfig;
    this.workers = [];
    this.freeWorkers = [];

    for (let i = 0; i < threads; i++) {
      this.createWorker();
    }
  }

  public get areAllTasksDone() {
    return this.freeWorkers.length === this.workers.length;
  }

  createWorker() {
    const worker = new Worker(
      this.workerConfig.path,
      this.workerConfig.options
    );

    worker.on("message", (data) => {
      worker[taskInfo].done(null, data);
      worker[taskInfo] = null;
      this.freeWorkers = [...this.freeWorkers, worker];

      this.emit(freeWorkerEvent);
    });

    worker.on("error", (err) => {
      if (worker[taskInfo]) {
        worker[taskInfo].done(err, null);
      } else {
        this.emit("error", err);
      }

      // delete the worker from the list and then recreate an other one
      this.workers.splice(this.workers.indexOf(worker), 1);
      this.createWorker();
    });

    this.workers = [...this.workers, worker];
    this.freeWorkers = [...this.freeWorkers, worker];
    this.emit(freeWorkerEvent);
  }

  runTask(task: string[], callback: (err, result) => void) {
    // if there's no free workers right now
    if (this.freeWorkers.length === 0) {
      this.once(freeWorkerEvent, () => this.runTask(task, callback));
      return;
    }

    const worker = this.freeWorkers.pop();
    if (worker) {
      worker[taskInfo] = new WorkerPoolTaskInfo(callback);
      worker.postMessage(task);
    }
  }

  close() {
    this.on(freeWorkerEvent, () => {
      if (this.areAllTasksDone) {
        for (const worker of this.workers) {
          worker.terminate();
        }
      }
    });

    if (this.areAllTasksDone) {
      for (const worker of this.workers) {
        worker.terminate();
      }
    }
  }
}

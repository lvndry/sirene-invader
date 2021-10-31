import { AsyncResource } from "async_hooks";
import { EventEmitter } from "events";
import { Worker, WorkerOptions } from "worker_threads";

const taskInfo = Symbol("kTaskInfo");
const freeWorkerEvent = Symbol("kFreeWorkerEvent");
const newtaskEvent = Symbol("kNewTaskEvent");

export class WorkerPoolTaskManager extends AsyncResource {
  public callback: (...args: any[]) => void;

  constructor(callback: (...args: any[]) => void) {
    super("WorkerPoolTaskManager");
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
  public tasksQueue: any[];

  constructor(
    threads: number,
    workerConfig: IWorkerConfig,
    taskCallback: (err: any, result: any) => void
  ) {
    console.log("Creating workerpool...");
    super();
    this.threads = threads;
    this.workerConfig = workerConfig;
    this.workers = [];
    this.freeWorkers = [];
    this.tasksQueue = [];

    for (let i = 0; i < threads; i++) {
      console.log(`Creating worker ${i}`);
      this.createWorker();
    }

    this.on(newtaskEvent, () => {
      // If there's a freeworker available and no other tasks waiting to be taken care of
      if (
        this.freeWorkers.length &&
        this.tasksQueue.length < this.freeWorkers.length
      ) {
        const worker = this.freeWorkers.shift();
        const task = this.tasksQueue.shift();
        if (worker) {
          worker[taskInfo] = new WorkerPoolTaskManager(taskCallback);
          worker.postMessage(task);
        }
      }
    });

    this.on(freeWorkerEvent, () => {
      if (this.tasksQueue.length && this.freeWorkers.length) {
        const worker = this.freeWorkers.shift();
        const task = this.tasksQueue.shift();

        if (worker) {
          worker[taskInfo] = new WorkerPoolTaskManager(taskCallback);
          worker.postMessage(task);
        }
      }
    });

    console.log("Workerpool created!");
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
      this.freeWorkers = this.freeWorkers.concat([worker]);

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

    this.workers = this.workers.concat([worker]);
    this.freeWorkers = this.freeWorkers.concat([worker]);
    this.emit(freeWorkerEvent);
  }

  runTask(task: string[]) {
    this.tasksQueue = this.tasksQueue.concat([task]);
    this.emit(newtaskEvent);
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

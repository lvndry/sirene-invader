import { AsyncResource } from "async_hooks";
import { EventEmitter } from "events";
import { Worker, WorkerOptions } from "worker_threads";

import { IStock } from "./stock.interface";

const taskInfo = Symbol("kTaskInfo");
const freeWorkerEvent = Symbol("kFreeWorkerEvent");
const newtaskEvent = Symbol("kNewTaskEvent");
const closingWorkerPool = Symbol("kClosingWorkerPool");

export class WorkerPoolTaskManager extends AsyncResource {
  public callback: (err: Error, result: IStock[]) => Promise<void>;

  constructor(callback: (err: Error, result: IStock[]) => Promise<void>) {
    super("WorkerPoolTaskManager");
    this.callback = callback;
  }

  async done(err: Error, result: IStock[]) {
    await this.runInAsyncScope(this.callback, null, err, result);
    this.emitDestroy();
  }
}

interface IWorkerConfig {
  path: string;
  options?: WorkerOptions;
}

type Task = string[];

export class WorkerPool extends EventEmitter {
  public workerConfig: IWorkerConfig;
  public workers: Worker[];
  public freeWorkers: Worker[];
  public tasksQueue: Task[];

  constructor(
    threads: number,
    workerConfig: IWorkerConfig,
    taskCallback: (err: Error, result: IStock[]) => Promise<void>
  ) {
    console.log("Creating workerpool...");
    super();
    this.workerConfig = workerConfig;
    this.workers = [];
    this.freeWorkers = [];
    this.tasksQueue = [];

    for (let i = 0; i < threads; i++) {
      console.log(`Creating worker ${i}`);
      this.createWorker();
    }

    this.on(newtaskEvent, () => {
      // If there's a freeworker available and no other tasks are waiting to be taken care of
      if (
        this.freeWorkers.length &&
        this.tasksQueue.length <= this.freeWorkers.length
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

  private get areAllTasksDone() {
    return this.freeWorkers.length === this.workers.length;
  }

  createWorker() {
    const worker = new Worker(
      this.workerConfig.path,
      this.workerConfig.options
    );

    worker.on("message", async (data) => {
      await worker[taskInfo].done(null, data);
      worker[taskInfo] = null;
      this.freeWorkers.push(worker);

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

    this.workers.push(worker);
    this.freeWorkers.push(worker);
    this.emit(freeWorkerEvent);
  }

  runTask(task: string[]) {
    this.tasksQueue.push(task);
    this.emit(newtaskEvent);
  }

  async close() {
    return new Promise((resolve, reject) => {
      console.log(
        "Waiting for all tasks to be completed before closing worker pool..."
      );

      this.on(freeWorkerEvent, () => {
        if (this.areAllTasksDone) {
          for (const worker of this.workers) {
            worker.terminate();
          }

          console.log(
            "All workers are terminated. Ready to close workerpool..."
          );

          this.emit(closingWorkerPool);
        }
      });

      if (this.areAllTasksDone) {
        for (const worker of this.workers) {
          worker.terminate();
        }

        console.log("All workers are terminated. Ready to close workerpool...");
        this.emit(closingWorkerPool);
      }

      this.once(closingWorkerPool, () => {
        console.log("Workerpool closed");
        resolve(null);
      });
    });
  }
}

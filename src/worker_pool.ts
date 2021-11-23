import { EventEmitter } from "events";
import { Worker, WorkerOptions } from "worker_threads";
import { performance } from "perf_hooks";

import { IStock } from "./stock.interface";

const freeWorkerEvent = Symbol("kFreeWorkerEvent");
const newtaskEvent = Symbol("kNewTaskEvent");
const closingWorkerPool = Symbol("kClosingWorkerPool");

interface IWorkerConfig {
  path: string;
  options?: WorkerOptions;
}

interface PoolWorker {
  instance: Worker;
  index: number;
}

type Task = string[];
type TaskCallback = (
  err: Error | null,
  result: IStock[] | null,
  index: number
) => Promise<void>;

export class WorkerPool extends EventEmitter {
  public workerConfig: IWorkerConfig;
  public workers: PoolWorker[];
  public freeWorkers: PoolWorker[];
  public tasksQueue: Task[];
  public taskCallback: TaskCallback;

  constructor(
    threads: number,
    workerConfig: IWorkerConfig,
    taskCallback: TaskCallback
  ) {
    console.log("Creating workerpool...");
    super();
    this.workerConfig = workerConfig;
    this.workers = [];
    this.freeWorkers = [];
    this.tasksQueue = [];
    this.taskCallback = taskCallback;

    for (let i = 0; i < threads; i++) {
      console.log(`Creating worker ${i}`);
      this.createWorker(i);
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
          performance.mark(`worker-${worker.index}-start`);
          worker.instance.postMessage(task);
        }
      }
    });

    this.on(freeWorkerEvent, () => {
      if (this.tasksQueue.length && this.freeWorkers.length) {
        const worker = this.freeWorkers.shift();
        const task = this.tasksQueue.shift();

        if (worker) {
          performance.mark(`worker-${worker.index}-start`);
          worker.instance.postMessage(task);
        }
      }
    });

    console.log("Workerpool created!");
  }

  private get areAllTasksDone() {
    return this.freeWorkers.length === this.workers.length;
  }

  createWorker(index: number) {
    const instance = new Worker(
      this.workerConfig.path,
      this.workerConfig.options
    );

    const worker = { instance, index };

    worker.instance.on("message", async (result) => {
      await this.taskCallback(null, result, index);
      this.freeWorkers.push(worker);
      this.emit(freeWorkerEvent);
    });

    worker.instance.on("error", async (err) => {
      await this.taskCallback(err, null, index);

      // delete the worker from the list and then recreate an other one
      this.workers.splice(this.workers.indexOf(worker), 1);
      this.createWorker(index);
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
            worker.instance.terminate();
          }

          console.log(
            "All workers are terminated. Ready to close workerpool..."
          );

          this.emit(closingWorkerPool);
        }
      });

      if (this.areAllTasksDone) {
        for (const worker of this.workers) {
          worker.instance.terminate();
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

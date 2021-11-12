import { ReadStream, createReadStream } from "fs";
import path from "path";
import { createInterface, Interface } from "readline";
import os from "os";
import { Model } from "mongoose";

import { WorkerPool } from "./worker_pool";
import { initDBConnection, shutdownConnection } from "./db";

interface SireneConfig {
  filePath: string;
  collectionName?: string;
}

export class Sirene {
  public filePath: string;

  private readStream: ReadStream;
  private readInterface: Interface;
  private workerPool: WorkerPool;
  private collectionName: string;

  private headerRead: boolean = false;
  private csvHeader: string[] = [];
  private mongooseModel: Model<any, {}, {}, {}> | undefined = undefined;
  private totalInsertedDocuments = 0;

  constructor(config: SireneConfig) {
    this.filePath = config.filePath;
    this.collectionName = config.collectionName || "sirene";

    this.readStream = createReadStream(path.resolve(__dirname, this.filePath), {
      encoding: "utf-8",
    });

    this.readInterface = createInterface({
      input: this.readStream,
      crlfDelay: Infinity,
      terminal: false,
    });

    this.readInterface.pause();

    this.workerPool = this.initWorkerpool();
  }

  private initWorkerpool() {
    const workerPath = path.join(__dirname, "./worker.js");

    const workerPoolCallback = async (err: Error, models: any[]) => {
      if (models && models.length) {
        const { insertedCount } =
          await this.mongooseModel!.collection.insertMany(models);

        this.totalInsertedDocuments += insertedCount;
        console.log(
          "Inserted %d documents so far",
          this.totalInsertedDocuments
        );
      }

      if (err) {
        console.error(err);
        this.readInterface.close();
      }
    };

    return new WorkerPool(
      os.cpus().length - 1,
      {
        path: workerPath,
        options: {
          workerData: { path: "./worker.ts" },
        },
      },
      workerPoolCallback
    );
  }

  async setup() {
    this.mongooseModel = await initDBConnection(this.collectionName);
    return this.mongooseModel;
  }

  async run() {
    console.time("sirene.run");
    const TASK_LOAD = 1000;
    let counter = 0;
    let lines: string[] = [];
    this.readInterface.resume();
    this.readInterface.on("line", async (line) => {
      if (!this.headerRead) {
        this.headerRead = true;
        this.csvHeader = line.split(",");
      } else {
        counter += 1;
        lines.push(line);

        if (counter === TASK_LOAD) {
          counter = 0;
          const taskData = [...lines];
          lines = [];
          this.workerPool.runTask({ keys: this.csvHeader, values: taskData });
        }
      }
    });

    this.readInterface.on("close", async () => {
      this.workerPool.runTask({ keys: this.csvHeader, values: lines });
      this.totalInsertedDocuments += lines.length;
      await this.workerPool.close();
      console.timeEnd("sirene.run");
      console.log(
        "Inserted %d documents in total",
        this.totalInsertedDocuments
      );
      await shutdownConnection();
      process.exit(0);
    });
  }
}

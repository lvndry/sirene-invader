import path from "path";
import { createReadStream } from "fs";
import { createInterface, emitKeypressEvents } from "readline";
import os from "os";
import { performance } from "perf_hooks";
import { InsertManyResult } from "mongoose";

import { WorkerPool } from "./worker_pool";
import { initDBConnection, shutdownConnection } from "./db";
import { StockModel } from "./stock.interface";

async function main() {
  console.time(__filename);
  const filePath = path.join(__dirname, "../stock.csv");
  const workerPath = path.join(__dirname, "./worker.js");

  const db = await initDBConnection();

  // Create stream reader, skip the 1305 first bytes to ignore the first line
  const inputStream = createReadStream(filePath, {
    start: 1305,
    encoding: "utf-8",
  });

  const rl = createInterface({
    input: inputStream,
    crlfDelay: Infinity,
    terminal: false,
  });

  if (process.stdin.isTTY) {
    emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    process.stdin.on("keypress", (str, key) => {
      if (key.ctrl) {
        if (key.name === "p") {
          console.log("Pause...");
          rl.pause();
        } else if (key.name === "r") {
          console.log("Resume...");
          rl.resume();
        } else if (key.name === "c") {
          console.log("Exiting program...");
          rl.close();
        }
      }
    });
  }

  const TASK_LOAD = 1000;
  const PROMISES_FLUSH_LIMIT = 500;

  let promises: Promise<InsertManyResult>[] = [];
  let lines: string[] = [];
  let total_inserted = 0;

  let workerPoolStart = performance.now();

  const workerPool = new WorkerPool(
    os.cpus().length,
    {
      path: workerPath,
      options: { workerData: { path: "./worker.ts" } },
    },
    async (err, models) => {
      if (models) {
        promises = promises.concat([StockModel.collection.insertMany(models)]);

        const workerPoolEnd = performance.now();

        console.log(
          `workerPool task took ${
            Math.trunc(workerPoolEnd - workerPoolStart) / 1000
          } seconds`
        );

        total_inserted += models.length;

        workerPoolStart = performance.now();
      }

      if (err) {
        console.error(err);
        rl.close();
      }
    }
  );

  console.log("Start reading file...");
  rl.on("line", async (line) => {
    lines = lines.concat([line]);

    if (promises.length === PROMISES_FLUSH_LIMIT) {
      const start = performance.now();
      const allPromises = [...promises];
      promises = [];
      await Promise.all(allPromises);
      const end = performance.now();
      console.log(`Promise all took ${(end - start) / 1000} seconds`);
      console.log(`Inserted ${total_inserted} in total`);
    }

    if (lines.length === TASK_LOAD) {
      const taskData = [...lines];
      lines = [];

      workerPool.runTask(taskData);
    }
  });

  rl.on("close", async () => {
    workerPool.runTask(lines);
    await workerPool.close();
    await Promise.all(promises);
    console.log(`Inserted ${total_inserted} documents in total`);
    console.timeEnd(__filename);
    process.exit();
  });

  process.on("exit", async () => {
    await shutdownConnection(db);
  });
}

main();

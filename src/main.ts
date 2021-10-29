import path from "path";
import { createReadStream } from "fs";
import { createInterface, emitKeypressEvents } from "readline";
import os from "os";
import { performance } from "perf_hooks";

import { WorkerPool } from "./worker_pool";
import { initDBConnection, shutdownConnection } from "./db";
import { StockModel } from "./stock.interface";
import { InsertManyResult } from "mongoose";

let promises: Promise<InsertManyResult>[] = [];

async function main() {
  console.time(__filename);
  const filePath = path.join(__dirname, "../stock.csv");
  const workerPath = path.join(__dirname, "./worker.js");

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
          process.exit();
        }
      }
    });
  }

  const db = await initDBConnection();

  const workerPool = new WorkerPool(os.cpus().length, {
    path: workerPath,
    options: { workerData: { path: "./worker.ts" } },
  });

  const WORKER_LOAD = 1000;
  const PROMISES_FLUSH_LIMIT = 500;

  let lines: string[] = [];
  let total_inserted = 0;

  console.log("Start reading file...");
  let start = performance.now();

  rl.on("line", async (line) => {
    lines = lines.concat([line]);

    if (lines.length === WORKER_LOAD) {
      const data = [...lines];
      lines = [];

      workerPool.runTask(data, async (err, models) => {
        const end = performance.now();

        console.log(
          `workerPool task took ${Math.trunc(end - start) / 1000} seconds`
        );

        if (models) {
          promises = promises.concat([
            StockModel.collection.insertMany(models),
          ]);
          total_inserted += models.length;
          console.log(`processed ${total_inserted} documents`);

          start = performance.now();
        }

        if (err) {
          console.error(err);
          process.exit();
        }
      });
    }

    if (promises.length === PROMISES_FLUSH_LIMIT) {
      const start = new Date().getTime();
      const clone = [...promises];
      promises = [];
      await Promise.all(clone);
      const end = new Date().getTime();
      console.log(`Promise all took ${(end - start) / 1000} seconds`);
    }
  });

  rl.on("close", async () => {
    if (promises.length > 0) {
      await Promise.all(promises);
      console.log(`Program inserted ${total_inserted} from stock.csv`);
    }
    console.timeEnd(__filename);
    workerPool.close();
  });

  process.on("exit", shutdownConnection);
}

main();

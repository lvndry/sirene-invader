import path from "path";
import { createReadStream } from "fs";
import { createInterface, emitKeypressEvents } from "readline";
import os from "os";
import { performance, PerformanceObserver } from "perf_hooks";

import { initDBConnection, shutdownConnection } from "./db";
import { IStock, StockModel } from "./stock.interface";
import { WorkerPool } from "./worker_pool";

const observer = new PerformanceObserver((list) => {
  const entry = list.getEntries()[0];
  console.log(`Entry ${entry.name}:`, entry.duration);
});

observer.observe({ entryTypes: ["measure"] });

async function main() {
  console.time(__filename);
  const filePath = path.join(__dirname, "../stock.csv");
  const workerPath = path.join(__dirname, "./worker.js");

  await initDBConnection();

  const inputStream = createReadStream(filePath, {
    encoding: "utf-8",
    start: 1305,
  });

  const rl = createInterface({
    input: inputStream,
    crlfDelay: Infinity,
    terminal: false,
  });

  const TASK_LOAD = 3000;

  let lines: string[] = [];
  let total_inserted = 0;

  if (process.stdin.isTTY) {
    emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    process.stdin.on("keypress", (str, key) => {
      if (key.ctrl) {
        if (key.name === "p") {
          console.log("Pause...");
          rl.pause();
          console.log(`Inserted ${total_inserted} documents so far`);
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

  const workerPoolCallback = async (
    err: Error | null,
    models: IStock[] | null,
    index: number
  ) => {
    if (models) {
      const { insertedCount } = await StockModel.collection.insertMany(models);

      performance.mark(`worker-${index}-end`);
      performance.measure(
        `Worker ${index}`,
        `worker-${index}-start`,
        `worker-${index}-end`
      );

      total_inserted += insertedCount;
    }

    if (err) {
      console.error(err);
      rl.close();
    }
  };

  const workerPool = new WorkerPool(
    os.cpus().length - 1,
    {
      path: workerPath,
      options: { workerData: { path: "./worker.ts" } },
    },
    workerPoolCallback
  );

  let firstLineRead = false;

  console.log("Start reading file...");
  rl.on("line", (line) => {
    lines.push(line);

    if (lines.length === TASK_LOAD) {
      const taskData = [...lines];
      lines = [];

      workerPool.runTask(taskData);
    }
  });

  rl.on("close", async () => {
    workerPool.runTask(lines);
    await workerPool.close();
    console.log(`Inserted ${total_inserted} documents in total`);
    console.timeEnd(__filename);
    await shutdownConnection();
    process.exit(0);
  });
}

main();

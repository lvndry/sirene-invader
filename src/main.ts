import path from "path";
import { createReadStream } from "fs";
import { createInterface, emitKeypressEvents } from "readline";
import os from "os";

import { WorkerPool } from "./worker_pool";
import { performance } from "perf_hooks";
import { initDBConnection } from "./db";
import { StockModel } from "./stock.interface";

async function main() {
  console.time(__filename);
  const filePath = path.join(__dirname, "../stock.csv");
  const workerPath = path.join(__dirname, "./worker.js");

  // Create stream reader, skip the 1305 first bytes to skip the first line
  const inputStream = createReadStream(filePath, { start: 1305 });
  const rl = createInterface({ input: inputStream });

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
        process.exit();
      }
    }
  });

  await initDBConnection();

  const workerPool = new WorkerPool(os.cpus().length, {
    path: workerPath,
    options: { workerData: { path: "./worker.ts" } },
  });

  const WORKER_LOAD = 1000;
  let lines: string[] = [];

  console.log("Start reading file...");
  rl.on("line", (line) => {
    lines = lines.concat([line]);

    if (lines.length === WORKER_LOAD) {
      const start = performance.now();

      workerPool.runTask(lines, async (err, models) => {
        const end = performance.now();

        console.log(
          `workerPool task took ${Math.trunc(end - start) / 1000} seconds`
        );

        if (err) {
          console.error(err);
        } else {
          const docs = await StockModel.insertMany(models);
          console.log(`Inserted ${docs.length} documents`);
        }
      });

      lines = [];
    }
  });

  rl.on("close", () => {
    console.timeEnd(__filename);
    workerPool.close();
  });
}

main();

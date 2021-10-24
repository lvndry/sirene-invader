import path from "path";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import os from "os";

import { WorkerPool } from "./worker_pool";
import { performance } from "perf_hooks";

console.time(__filename);

const filePath = path.join(__dirname, "../stock.csv");
const workerPath = path.join(__dirname, "./worker.js");

// Create stream reader, skip the 1305 first bytes to skip the first line
const inputStream = createReadStream(filePath, { start: 1305 });
const rl = createInterface({ input: inputStream });

let lines: string[] = [];

const workerPool = new WorkerPool(os.cpus().length, {
  path: workerPath,
  options: { workerData: { path: "./worker.ts" } },
});

const WORKER_LOAD = 500;

rl.on("line", (line) => {
  lines = lines.concat([line]);

  if (lines.length === WORKER_LOAD) {
    const start = performance.now();

    workerPool.runTask(lines, (err, result) => {
      const end = performance.now();

      console.log(
        `workerPool task took ${Math.trunc(end - start) / 1000} seconds`
      );

      if (err) {
        console.error(err);
      } else {
        console.log(result);
      }
    });

    lines = [];
  }
});

rl.on("close", () => {
  console.timeEnd(__filename);
  // workerPool.close();
});

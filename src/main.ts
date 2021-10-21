import path from "path";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { performance } from "perf_hooks";

process.env.UV_THREADPOOL_SIZE = "6";

const filePath = path.resolve(__dirname, "../stock.csv");

const inputStream = createReadStream(filePath);
const rl = createInterface({ input: inputStream });

const start = performance.now();

rl.on("line", (line) => {});

rl.on("close", () => {
  console.log("closed");
  const end = performance.now();
  console.log(`Call to doSomething took ${end - start} milliseconds`);
});

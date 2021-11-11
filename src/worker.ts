import { parentPort } from "worker_threads";

import { Task } from "./worker_pool";

type LineEntries = [string, string][];

parentPort?.on("message", (task: Task) => {
  const models = task.values.map((line, i) => {
    const data = line.split(",");
    const entries = data
      .map((d, keyIndex) => {
        return [task.keys[keyIndex], d || undefined];
      })
      .filter(([key, value]) => value !== undefined) as LineEntries;

    return Object.fromEntries(entries);
  });

  parentPort?.postMessage(models);
});

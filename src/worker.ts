import { parentPort } from "worker_threads";

import { IStock, StockModel } from "./stock.interface";

parentPort?.on("message", (values: IStock[]) => {
  console.log(values.length);
  // const data = values[0];
  // const stockModel = new StockModel(data);
});

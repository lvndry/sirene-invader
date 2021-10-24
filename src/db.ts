import mongoose from "mongoose";
import { StockModel } from "./stock.interface";

export const initDBConnection = async () => {
  const db = await mongoose.connect("mongodb://localhost:27017/sirene", {
    appName: "sirene-app",
    ignoreUndefined: true,
    minPoolSize: 3,
  });

  await StockModel.deleteMany({});
  console.log("Delete stocks from database");

  return db;
};

import mongoose, { connection } from "mongoose";

import { StockModel } from "./stock.interface";

export const initDBConnection = async () => {
  console.log("Connecting to database");
  const db = await mongoose.connect("mongodb://localhost:27017/sirene", {
    appName: "sirene-app",
    ignoreUndefined: true,
    minPoolSize: 5,
    maxPoolSize: 100,
  });
  console.log("Connection: Ok");

  console.log("Deleting old values in database...");
  await StockModel.deleteMany({});
  console.log("Deletion of old values: Ok");

  return db;
};

export const shutdownConnection = async (db: any) => {
  console.log("Closing connection...");
  await db.connection.close();
  console.log("Connection closed");
};

import mongoose, { model, Schema } from "mongoose";

let db: typeof mongoose;

export const initDBConnection = async (collectionName: string) => {
  console.log("Connecting to database");
  db = await mongoose.connect("mongodb://localhost:27017/sirene", {
    appName: "sirene-app",
    ignoreUndefined: true,
    minPoolSize: 5,
    maxPoolSize: 100,
  });
  console.log("Connection: Ok");

  const SireneSchema = new Schema<any>();
  const SireneModel = model(collectionName.toLowerCase(), SireneSchema);

  console.log("Deleting old values in database...");
  await SireneModel.deleteMany({});
  console.log("Deletion of old values: Ok");

  return SireneModel;
};

export const shutdownConnection = async () => {
  console.log("Closing connection...");
  await db.disconnect();
  console.log("Connection closed");
  return;
};

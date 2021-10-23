import mongoose from "mongoose";

export const initDBConnection = async () => {
  await mongoose.connect("mongodb://localhost:27017/sirene", {
    appName: "sirene-app",
    ignoreUndefined: true,
    minPoolSize: 3,
  });
};

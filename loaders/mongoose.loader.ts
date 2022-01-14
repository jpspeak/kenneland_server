import mongoose from "mongoose";
import config from "../src/config";

export default async () => {
  await mongoose.connect(config.database.mongodb.uri);
  console.log("Connected to Database");
};

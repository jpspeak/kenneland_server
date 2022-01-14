import { Express } from "express";
import expressAppLoader from "./express-app.loader";
import mongooseLoader from "./mongoose.loader";

export default async (app: Express) => {
  await mongooseLoader();
  await expressAppLoader(app);
};

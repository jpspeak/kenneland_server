import cookieParser from "cookie-parser";
import express, { Express } from "express";
import cors from "cors";
import config from "../src/config";
import routes from "../src/routes";
import errorHandler from "../src/middlewares/error-handler";

export default async (app: Express) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(express.static("public"));

  //CORS POLICY
  app.use(cors({ origin: config.allowedOrigin }));

  // ROUTES
  routes(app);

  //ERROR HANDLER
  app.use(errorHandler);
};

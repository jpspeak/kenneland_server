import csurf from "csurf";
import { Express } from "express-serve-static-core";
import TokenController from "../controllers/token.controller";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import resetPasswordRoutes from "./reset-password.routes";
import kennelRoutes from "./kennel.routes";
import studRoutes from "./stud.routes";
import favoriteStudRoutes from "./favorite.routes";
import forSalePetRoutes from "./for-sale-pet.routes";
import conversationRoutes from "./conversation.routes";
import messageRoutes from "./message.routes";
import UploadController from "../controllers/upload.controller";
import DogBreedController from "../controllers/dog-breed.controller";

const routes = (app: Express) => {
  app.post("/refresh-token", TokenController.refreshToken);
  app.get("/dog-breeds", DogBreedController.getAll);
  app.use("/auth", authRoutes);
  app.use("/password", resetPasswordRoutes);
  app.use("/users", userRoutes);
  app.use(kennelRoutes);
  app.use(favoriteStudRoutes);
  app.use(studRoutes);
  app.use(forSalePetRoutes);
  app.use(conversationRoutes);
  app.use(messageRoutes);
  app.get("/upload", UploadController.upload);
  app.get("*", (_, res) => {
    res.status(404).json({
      message: "Not Found"
    });
  });
};

export default routes;

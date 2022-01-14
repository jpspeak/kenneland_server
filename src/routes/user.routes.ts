import express from "express";
import UserController from "../controllers/user.controller";
import checkAuth from "../middlewares/check-auth";
import requireAuth from "../middlewares/require-auth";
import UserValidation from "../validations/user.validation";
const router = express.Router();

router.get("/me", checkAuth, requireAuth, UserController.getSelf);
router.post("/:userId", checkAuth, requireAuth, UserValidation.update, UserController.update);
router.put("/me/password", checkAuth, requireAuth, UserValidation.updatePassword, UserController.updatePassword);
router.delete("/me", checkAuth, requireAuth, UserController.remove);
router.get("/:userId", UserController.getOne);

export default router;

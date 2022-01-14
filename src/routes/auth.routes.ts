import express from "express";
import AuthController from "../controllers/auth.controller";
import AuthValidation from "../validations/auth.validation";
const router = express.Router();

router.post("/login", AuthValidation.validateLoginInput, AuthController.login);
router.post("/register", AuthValidation.validateRegisterInput, AuthController.register);
router.post("/logout", AuthValidation.validateLogoutInput, AuthController.logout);

export default router;

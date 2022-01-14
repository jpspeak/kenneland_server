import express from "express";
import ResetPasswordController from "../controllers/reset-password.controller";
import ResetPassworldValidation from "../validations/reset-password.validation";
const router = express.Router();

router.post("/request-reset", ResetPassworldValidation.validateRequestResetInput, ResetPasswordController.requestReset);
router.post("/reset", ResetPassworldValidation.validateResetPasswordInput, ResetPasswordController.resetPassword);

export default router;

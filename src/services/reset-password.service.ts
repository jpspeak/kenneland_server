import createHttpError from "http-errors";
import sendResetPasswordMail from "../mails/reset-password/sendResetPasswordMail";
import User from "../models/user.model";
import { createResetPasswordToken } from "../utils/token";
import jwt from "jsonwebtoken";
import config from "../config";
import bcrypt from "bcrypt";

const requestReset = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw createHttpError(422, "No user found with that email.");

  const resetPasswordToken = createResetPasswordToken({ id: user.id });
  sendResetPasswordMail(user.email, resetPasswordToken);
  return true;
};

const resetPassword = async (resetPasswordToken: string, password: string) => {
  //Update password
  const payload = jwt.verify(resetPasswordToken, config.token.resetPasswordTokenSecretKey);
  if (!payload) throw createHttpError(401, "Invalid/Expired Token.");
  const userId = (payload as any).id;

  const user = await User.findById(userId);

  if (!user) throw new Error("User not found.");

  const newPassword = await bcrypt.hash(password, 12);

  user.password = newPassword;

  await user.save();
  return true;
};

const ResetPasswordService = { requestReset, resetPassword };

export default ResetPasswordService;

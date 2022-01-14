import asyncHandler from "../helpers/async-wrapper";
import ResetPasswordService from "../services/reset-password.service";

const requestReset = asyncHandler(async (req, res) => {
  const email = req.body.email;
  await ResetPasswordService.requestReset(email);

  res.status(204).end();
});

const resetPassword = asyncHandler(async (req, res) => {
  const { resetPasswordToken, password } = req.body;
  await ResetPasswordService.resetPassword(resetPasswordToken, password);

  res.status(204).end();
});

const ResetPasswordController = { requestReset, resetPassword };

export default ResetPasswordController;

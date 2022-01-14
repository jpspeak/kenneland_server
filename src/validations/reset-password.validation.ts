import * as Yup from "yup";
import asyncHandler from "../helpers/async-wrapper";

const validateRequestResetInput = asyncHandler(async (req, _, next) => {
  const schema = Yup.object().shape({
    email: Yup.string()
      .label("Email")
      .required()
      .email()
  });

  const validatedData = await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  req.body = validatedData;
  next();
});

const validateResetPasswordInput = asyncHandler(async (req, _, next) => {
  const schema = Yup.object().shape({
    resetPasswordToken: Yup.string()
      .label("Token")
      .required()
      .min(8)
      .max(255),
    password: Yup.string()
      .label("Password")
      .required()
      .min(8)
      .max(255),
    passwordConfirm: Yup.string()
      .label("Password confirmation")
      .required()
      .oneOf([Yup.ref("password"), null], "Password mismatch")
  });

  const validatedData = await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  req.body = validatedData;
  next();
});

const ResetPassworldValidation = { validateRequestResetInput, validateResetPasswordInput };
export default ResetPassworldValidation;

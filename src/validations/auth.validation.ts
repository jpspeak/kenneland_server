import * as Yup from "yup";
import asyncHandler from "../helpers/async-wrapper";

const validateFacebookLoginInput = asyncHandler(async (req, _, next) => {
  const schema = Yup.object().shape({
    fbUserAccessToken: Yup.string()
      .label("Access Token")
      .required()
  });
  const validatedData = await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  req.body = validatedData;
  next();
});

const validateGoogleLoginInput = asyncHandler(async (req, _, next) => {
  const schema = Yup.object().shape({
    idToken: Yup.string()
      .label("ID Token")
      .required()
  });
  const validatedData = await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  req.body = validatedData;
  next();
});

const validateLoginInput = asyncHandler(async (req, _, next) => {
  const schema = Yup.object().shape({
    email: Yup.string()
      .label("Email")
      .required()
      .email(),
    password: Yup.string()
      .label("Password")
      .required()
  });
  const validatedData = await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  req.body = validatedData;
  next();
});

const validateLogoutInput = asyncHandler(async (req, _, next) => {
  const schema = Yup.object().shape({
    refreshToken: Yup.string()
      .label("Refresh Token")
      .required()
  });
  const validatedData = await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  req.body = validatedData;
  next();
});

const validateRegisterInput = asyncHandler(async (req, _, next) => {
  const schema = Yup.object().shape({
    email: Yup.string()
      .label("Email")
      .required()
      .email(),
    firstName: Yup.string()
      .label("First name")
      .required()
      .min(2)
      .max(255),
    lastName: Yup.string()
      .label("Last name")
      .required()
      .min(2)
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

const AuthValidation = { validateFacebookLoginInput, validateGoogleLoginInput, validateLoginInput, validateRegisterInput, validateLogoutInput };
export default AuthValidation;

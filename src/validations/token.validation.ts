import * as Yup from "yup";
import asyncHandler from "../helpers/async-wrapper";

const validateRefreshTokenInput = asyncHandler(async (req, _, next) => {
  const schema = Yup.object().shape({
    refreshToken: Yup.string()
      .label("Refresh Token")
      .required()
  });

  const validatedData = await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  req.body = validatedData;
  next();
});

const TokenValidation = { validateRefreshTokenInput };
export default TokenValidation;

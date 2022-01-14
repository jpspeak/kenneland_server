import jwt from "jsonwebtoken";
import config from "../config";

export const createAccessToken = (payload: any) => {
  return jwt.sign(payload, config.token.accessTokenSecretKey, {
    expiresIn: "5d"
  });
};

export const createRefreshToken = (payload: any) => {
  return jwt.sign(payload, config.token.refreshTokenSecretKey, {
    expiresIn: "7d"
  });
};

export const createResetPasswordToken = (payload: any) => {
  return jwt.sign(payload, config.token.resetPasswordTokenSecretKey, {
    expiresIn: "5m"
  });
};

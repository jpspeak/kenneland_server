import { Request, Response, NextFunction } from "express";
import asyncHandler from "../helpers/async-wrapper";
import createHttpError from "http-errors";
import RefreshToken from "../models/refresh-token.model";
import config from "../config/index";
import jwt from "jsonwebtoken";
import { createAccessToken, createRefreshToken } from "../utils/token";

const refreshToken = async (refreshToken: string) => {
  //Check if token exists in database else return error
  const refreshTokenResult = await RefreshToken.findOne({ token: refreshToken });
  if (!refreshTokenResult) throw createHttpError(401, "Invalid/Expired token.");

  //Verify token else delete token from database and return error
  const payload = jwt.verify(refreshToken, config.token.refreshTokenSecretKey);
  const userId = (payload as any).id;
  if (!payload) {
    await refreshTokenResult.remove();
    throw createHttpError(401, "Invalid/Expired token.");
  }
  const newAccessToken = createAccessToken({ id: userId });
  const newRefreshToken = createRefreshToken({ id: userId });

  await RefreshToken.findOneAndUpdate({ user: userId, token: refreshToken }, { token: newRefreshToken });

  return { newAccessToken, newRefreshToken };
};

const RefreshTokenService = { refreshToken };
export default RefreshTokenService;

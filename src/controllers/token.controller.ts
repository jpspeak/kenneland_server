import { Request, Response } from "express";
import asyncHandler from "../helpers/async-wrapper";
import RefreshTokenService from "../services/refresh-token.service";

const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken;
  const { newAccessToken, newRefreshToken } = await RefreshTokenService.refreshToken(refreshToken);

  res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
});

const TokenController = { refreshToken };
export default TokenController;

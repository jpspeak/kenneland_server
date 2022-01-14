import createHttpError from "http-errors";
import asyncHandler from "../helpers/async-wrapper";
import User, { AuthProvider, IUser } from "../models/user.model";
import { createAccessToken, createRefreshToken } from "../utils/token";
import bcrypt from "bcrypt";
import RefreshToken from "../models/refresh-token.model";
import { OAuth2Client } from "google-auth-library";
import config from "../config";
import AuthService from "../services/auth.service";

// Login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await AuthService.login(email, password);

  res.status(200).json(response(accessToken, refreshToken, user));
});

// Register
const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await AuthService.register(req.body);

  res.status(201).json(response(accessToken, refreshToken, user));
});

// Facebook login
const facebookLogin = asyncHandler(async (req, res) => {
  const { fbUserAccessToken } = req.body;
  const { user, accessToken, refreshToken } = await AuthService.facebookLogin(fbUserAccessToken);

  res.status(200).json(response(accessToken, refreshToken, user));
});

const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  const { user, accessToken, refreshToken } = await AuthService.googleLogin(idToken);

  res.status(200).json(response(accessToken, refreshToken, user));
});

//Logout
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  await AuthService.logout(refreshToken);

  res.status(204).end();
});

// Response builder
const response = (accessToken: string, refreshToken: string, user: IUser) => {
  const { password, role, ...userObj } = user.toObject();
  return {
    accessToken,
    refreshToken,
    user: userObj
  };
};

const AuthController = { login, register, facebookLogin, googleLogin, logout };
export default AuthController;

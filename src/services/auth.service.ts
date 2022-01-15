import createHttpError from "http-errors";
import asyncHandler from "../helpers/async-wrapper";
import RefreshToken from "../models/refresh-token.model";
import User, { AuthProvider } from "../models/user.model";
import { createAccessToken, createRefreshToken } from "../utils/token";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import config from "../config";
import "isomorphic-fetch";

type RegisterInput = { email: string; firstName: string; lastName: string; password: string };
type IGoogleUser = {
  email: string;
  given_name: string;
  family_name: string;
  picture: string;
};

const login = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw createHttpError(401, { errors: [{ message: "Invalid credentials." }] });

  const hashedPassword = user.password || "";
  const isPasswordValid = await bcrypt.compare(password, hashedPassword);
  if (!isPasswordValid) throw createHttpError(401, { errors: [{ message: "Invalid credentials." }] });

  const accessToken = createAccessToken({ id: user.id });
  const refreshToken = createRefreshToken({ id: user.id });

  // Save refresh token in DB
  await RefreshToken.create({
    user: user.id,
    token: refreshToken
  });

  return { user, accessToken, refreshToken };
};

const register = async (registerInput: RegisterInput) => {
  const { email, firstName, lastName, password } = registerInput;

  // Check if email is already taken
  let user = await User.findOne({ email });
  if (user) throw createHttpError(422, { errors: [{ message: "Email is already taken." }] });

  // Create User
  const hashedPassword = await bcrypt.hash(password, 12);

  user = new User({
    email: email,
    firstName: firstName,
    lastName: lastName,
    name: firstName + " " + lastName,
    password: hashedPassword,
    provider: AuthProvider.LOCAL
  });

  user = await user.save();
  const accessToken = createAccessToken({ id: user.id });
  const refreshToken = createRefreshToken({ id: user.id });

  // Save refresh token in DB
  await RefreshToken.create({
    user: user.id,
    token: refreshToken
  });

  return { user, accessToken, refreshToken };
};

const facebookLogin = async (_accessToken: string) => {
  //Fetch user's facebook data

  interface IFbUser {
    email: string;
    first_name: string;
    last_name: string;
    picture: { data: { url: string } };
  }

  const fbUser = await fetch(`https://graph.facebook.com/me?fields=email,first_name,last_name,picture&access_token=${_accessToken}`).then(res => res.json() as Promise<IFbUser>);

  //Find or create user
  let user = await User.findOne({ email: fbUser.email });

  //Check if email was registered manually
  if (user?.provider === AuthProvider.LOCAL) {
    throw createHttpError(422, { errors: [{ message: "Account was created manually using your facebook email address. Please log in manually." }] });
  }

  if (!user) {
    user = new User({
      email: fbUser.email,
      firstName: fbUser.first_name,
      lastName: fbUser.last_name,
      name: fbUser.first_name + " " + fbUser.last_name,
      displayPicture: fbUser.picture.data.url,
      provider: AuthProvider.FACEBOOK
    });
  }

  user = await user.save();

  const accessToken = createAccessToken({ id: user.id });
  const refreshToken = createRefreshToken({ id: user.id });

  // Save refresh token in DB
  await RefreshToken.create({
    user: user.id,
    token: refreshToken
  });

  return { user, accessToken, refreshToken };
};

const googleLogin = async (idToken: string) => {
  const googleClient = new OAuth2Client(config.google.clientId);
  //Fetch user's google data
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: config.google.clientId
  });
  const gooogleUser = ticket.getPayload() as IGoogleUser;

  //Find or create user
  let user = await User.findOne({ email: gooogleUser.email });

  //Check if email was registered manually
  if (user?.provider === AuthProvider.LOCAL) {
    throw createHttpError(422, { errors: [{ message: "Account was created manually using your google email address. Please log in manually." }] });
  }

  if (!user) {
    user = new User({
      email: gooogleUser.email,
      firstName: gooogleUser.given_name,
      lastName: gooogleUser.family_name,
      name: gooogleUser.given_name + " " + gooogleUser.family_name,
      displayPicture: gooogleUser.picture,
      provider: AuthProvider.GOOGLE
    });
  }

  user = await user.save();

  const accessToken = createAccessToken({ id: user.id });
  const refreshToken = createRefreshToken({ id: user.id });

  // Save refresh token in DB
  await RefreshToken.create({
    user: user.id,
    token: refreshToken
  });

  return { user, accessToken, refreshToken };
};

const logout = async (refreshToken: string) => {
  //check if there is a token
  if (!refreshToken) throw new createHttpError.Unauthorized();

  //Delete token in DB
  await RefreshToken.deleteOne({ token: refreshToken });
};

const AuthService = { login, register, facebookLogin, googleLogin, logout };
export default AuthService;

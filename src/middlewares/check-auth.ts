import jwt from "jsonwebtoken";
import config from "../config";
import CustomRequest from "../types/custom-request";
import User from "../models/user.model";
import getBearerToken from "../utils/get-bearer-token";
import asyncWrapper from "../helpers/async-wrapper";

const checkAuth = asyncWrapper(async (req: CustomRequest, _, next) => {
  let user;
  const accessToken = getBearerToken(req);
  if (accessToken) {
    const payload = jwt.verify(accessToken, config.token.accessTokenSecretKey);
    const userId = (payload as any).id;
    user = await User.findById(userId);
  }
  req.user = user;
  next();
});

export default checkAuth;

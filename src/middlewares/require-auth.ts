import createHttpError from "http-errors";
import CustomRequest from "../types/custom-request";
import asyncWrapper from "../helpers/async-wrapper";

const requireAuth = asyncWrapper(async (req: CustomRequest, _, next) => {
  if (!req.user) throw createHttpError(401);
  next();
});

export default requireAuth;

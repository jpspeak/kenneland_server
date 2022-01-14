import { Request } from "express";
import createHttpError from "http-errors";

const getBearerToken = (req: Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  return token;
};

export default getBearerToken;

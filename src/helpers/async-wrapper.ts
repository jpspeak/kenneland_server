import { Response, NextFunction } from "express";
import CustomRequest from "../types/custom-request";

const asyncWrapper = (fn: (req: CustomRequest, res: Response, next: NextFunction) => void) => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export default asyncWrapper;

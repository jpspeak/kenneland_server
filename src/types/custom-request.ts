import { Request } from "express";

export default interface CustomRequest extends Request {
  [key: string]: any;
}

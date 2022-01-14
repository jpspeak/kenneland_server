import { ErrorRequestHandler } from "express";
import { JsonWebTokenError } from "jsonwebtoken";
import multer from "multer";
import { ValidationError } from "yup";

const errorHandler: ErrorRequestHandler = (error, _, res, next) => {
  //Multer error
  if (error instanceof multer.MulterError) {
    return res.status(422).json({
      message: error.message
    });
  }
  //JWT error
  if (error instanceof JsonWebTokenError) {
    return res.status(401).json({
      message: error.message
    });
  }
  //Yup validation error
  if (error instanceof ValidationError) {
    const errors = error.inner.map(innerError => {
      return { message: innerError.message, path: innerError.path };
    });
    return res.status(422).json({
      message: error.message,
      errors
    });
  }
  if (error.status) {
    return res.status(error.status).json({
      message: error.message,
      errors: error.errors
    });
  }
  console.log(error);
  res.status(500).json({
    message: "Something went wrong!"
  });
};

export default errorHandler;

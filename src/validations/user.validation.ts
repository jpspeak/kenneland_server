import * as Yup from "yup";
import asyncHandler from "../helpers/async-wrapper";
import User from "../models/user.model";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import { upload } from "../config/multer";
import fs from "fs";

const update = asyncHandler(async (req, res, next) => {
  const schema = Yup.object().shape({
    firstName: Yup.string()
      .label("First name")
      .required()
      .min(2)
      .max(255),
    lastName: Yup.string()
      .label("Last name")
      .required()
      .min(2)
      .max(255)
  });
  const updateUploads = upload.fields([{ name: "displayPicture", maxCount: 1 }]);

  updateUploads(req, res, async error => {
    if (error) next(error);
    schema
      .validate(req.body, { abortEarly: false, stripUnknown: true })
      .then(validatedData => {
        req.body = validatedData;

        next();
      })
      .catch(error => {
        //Field validation fails. Remove uploaded files
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (files) {
          for (const fieldname in files) {
            fs.unlink(files[fieldname][0].path, () => {});
          }
        }

        next(error);
      });
  });
});

const updatePassword = asyncHandler(async (req, _, next) => {
  const schema = Yup.object().shape({
    passwordCurrent: Yup.string()
      .label("Current Password")
      .required("Required")
      .min(8),
    passwordNew: Yup.string()
      .label("New Password")
      .required("Required")
      .min(8),
    passwordNewConfirm: Yup.string()
      .label("New password confirmation")
      .required("Required")
      .oneOf([Yup.ref("passwordNew"), null], "Password mismatch")
  });

  const validatedData = await schema.validate(req.body, { abortEarly: false, stripUnknown: true });

  const user = await User.findById(req.user._id).select("+password");
  if (!user) throw new Error("User not found");

  const { passwordCurrent } = validatedData;
  const hashedPassword = user.password || "";
  const isPasswordValid = await bcrypt.compare(passwordCurrent, hashedPassword);
  if (!isPasswordValid) throw createHttpError(422, { errors: [{ message: "Current password is invalid." }] });

  req.body = validatedData;
  next();
});

const UserValidation = { update, updatePassword };
export default UserValidation;

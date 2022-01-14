import User, { IUser } from "../models/user.model";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import { isValidObjectId } from "mongoose";
import MediaService from "./media.service";
import config from "../config";
import { UpdateUserBody } from "../types/request-body.types";

const getOne = async (userId: string) => {
  if (!isValidObjectId(userId)) throw new createHttpError.NotFound();
  const user = await User.findById(userId);
  if (!user) throw new createHttpError.NotFound();

  return user;
};

const update = async (userId: string, updateUserBody: UpdateUserBody, user: IUser, displayPicture?: Express.Multer.File) => {
  if (!isValidObjectId(userId)) throw new createHttpError.NotFound();
  const existingUser = await User.findById(userId);
  if (!existingUser) throw new Error("User not found.");

  if (existingUser.id !== user.id) throw new createHttpError.Forbidden();

  if (displayPicture) {
    const imageObjectKey = await MediaService.uploadImage(displayPicture.path, user.id);
    const imageUrl = config.aws.cloudfront.s3BaseUrl + "/" + imageObjectKey;
    existingUser.displayPicture = imageUrl;
  }

  existingUser.firstName = updateUserBody.firstName;
  existingUser.lastName = updateUserBody.lastName;

  const updatedUser = await existingUser.save();

  return updatedUser;
};

const remove = async (userId: string) => {
  if (!isValidObjectId(userId)) throw new createHttpError.NotFound();
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found.");

  await user.remove();
  return true;
};

const updatePassword = async (userId: string, newPassword: string) => {
  if (!isValidObjectId(userId)) throw new createHttpError.NotFound();
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found.");

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedPassword;
  await user.save();

  return true;
};

const UserService = { getOne, update, updatePassword, remove };
export default UserService;

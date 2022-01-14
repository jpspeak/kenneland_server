import asyncHandler from "../helpers/async-wrapper";
import KennelService from "../services/kennel.service";
import UserService from "../services/user.service";
import CustomRequest from "../types/custom-request";
import { UpdateStudBody, UpdateUserBody } from "../types/request-body.types";

const getOne = asyncHandler(async (req: CustomRequest, res) => {
  const userId = req.params.userId;
  const user = await UserService.getOne(userId);
  const kennel = await KennelService.getByUser(user._id);
  return res.json({ ...user.toObject(), kennel });
});
const getSelf = asyncHandler(async (req: CustomRequest, res) => {
  const user = req.user;
  const kennel = await KennelService.getByUser(user._id);
  return res.json({ ...user._doc, kennel });
});

const update = asyncHandler(async (req: CustomRequest, res) => {
  const user = req.user;
  const userId = req.params.userId;
  const updateUserBody = req.body as UpdateUserBody;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const displayPicture = files.displayPicture?.[0];
  const updatedUser = await UserService.update(userId, updateUserBody, user, displayPicture);
  res.json(updatedUser);
});

const updatePassword = asyncHandler(async (req: CustomRequest, res) => {
  const userId = req.user.id;
  const newData = req.body;

  const newPassword = newData.passwordNew;
  await UserService.updatePassword(userId, newPassword);
  res.status(204).end();
});

const remove = asyncHandler(async (req: CustomRequest, res) => {
  const userId = req.user.id;

  await UserService.remove(userId);
  res.status(204).end();
});

const UserController = { getOne, getSelf, update, updatePassword, remove };
export default UserController;

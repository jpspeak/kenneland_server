import asyncWrapper from "../helpers/async-wrapper";
import CustomRequest from "../types/custom-request";
import KennelService from "../services/kennel.service";
import { CreateKennelBody } from "../types/request-body.types";

const getAll = asyncWrapper(async (req, res) => {
  const kennels = await KennelService.getAll(req.query, 20);
  res.json(kennels);
});

const getOne = asyncWrapper(async (req, res) => {
  const kennelId = req.params.kennelId;
  const kennel = await KennelService.getOne(kennelId);
  return res.json(kennel);
});

const getYouMightLike = asyncWrapper(async (req, res) => {
  const kennel = await KennelService.getYouMightLike(req.query, 1);
  return res.json(kennel);
});

const create = asyncWrapper(async (req: CustomRequest, res) => {
  const user = req.user;
  const userId = req.params.userId;
  const createKennelBody = req.body as CreateKennelBody;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const displayPicture = files.displayPicture?.[0];
  const banner = files.banner?.[0];
  const createdKennel = await KennelService.create(user, userId, createKennelBody, displayPicture, banner);
  return res.json(createdKennel);
});

const update = asyncWrapper(async (req: CustomRequest, res) => {
  const user = req.user;
  const kennelId = req.params.kennelId;
  const updateKennelBody = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const displayPicture = files.displayPicture?.[0];
  const banner = files.banner?.[0];
  const updatedKennel = await KennelService.update(user, kennelId, updateKennelBody, displayPicture, banner);
  return res.json(updatedKennel);
});

const getRandom = asyncWrapper(async (req, res) => {
  const randomKennels = await KennelService.getRandom(3);
  res.json(randomKennels);
});

const follow = asyncWrapper(async (req, res) => {
  const kennelId = req.params.kennelId as string;
  const userId = req.params.userId as string;
  const user = req.user;
  await KennelService.follow(user, kennelId, userId);
  res.status(204).end();
});

const unfollow = asyncWrapper(async (req, res) => {
  const kennelId = req.params.kennelId as string;
  const userId = req.params.userId as string;
  const user = req.user;
  await KennelService.unfollow(user, kennelId, userId);
  res.status(204).end();
});

const isFollowedByUser = asyncWrapper(async (req, res) => {
  const kennelId = req.params.kennelId as string;
  const userId = req.params.userId as string;
  const isFollowedByUser = await KennelService.isFollowedByUser(kennelId, userId);
  res.json(isFollowedByUser);
});

const KennelController = { getAll, getOne, getYouMightLike, create, update, getRandom, follow, unfollow, isFollowedByUser };
export default KennelController;

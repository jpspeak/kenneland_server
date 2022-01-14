import asyncWrapper from "../helpers/async-wrapper";
import ForSalePetService from "../services/for-sale-pet.service";
import { CreateForSaleBody, UpdateForSaleBody } from "../types/request-body.types";

const getAll = asyncWrapper(async (req, res) => {
  const forSalePets = await ForSalePetService.getAll(req.query, 20);
  res.json(forSalePets);
});

const getAllFollowed = asyncWrapper(async (req, res) => {
  const userId = req.params.userId;
  const forSalePets = await ForSalePetService.getAllFollowed(userId, req.query, 20);
  res.json(forSalePets);
});

const getOne = asyncWrapper(async (req, res) => {
  const forSalePetId = req.params.forSalePetId as string;
  const forSalePet = await ForSalePetService.getOne(forSalePetId);
  res.json(forSalePet);
});

const create = asyncWrapper(async (req, res) => {
  const user = req.user;
  const kennelId = req.params.kennelId;
  const createForSaleBody = req.body as CreateForSaleBody;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const images = files.images;
  const forSalePet = await ForSalePetService.create(createForSaleBody, images, kennelId, user);
  res.status(201).json(forSalePet);
});

const update = asyncWrapper(async (req, res) => {
  const user = req.user;
  const forSalePetId = req.params.forSalePetId;
  const updateForSaleBody = req.body as UpdateForSaleBody;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const images = files.images;
  const forSalePet = await ForSalePetService.update(updateForSaleBody, forSalePetId, user, images);
  res.json(forSalePet);
});

const destroy = asyncWrapper(async (req, res) => {
  const user = req.user;
  const forSalePetId = req.params.forSalePetId;
  await ForSalePetService.destroy(forSalePetId, user);
  res.status(204).end();
});

const getRandom = asyncWrapper(async (req, res) => {
  const randomForSalePets = await ForSalePetService.getRandom(3);
  res.json(randomForSalePets);
});

const getByKennelId = asyncWrapper(async (req, res) => {
  const kennelId = req.params.kennelId as string;
  const user = req.user;
  const forSalePets = await ForSalePetService.getByKennelId(kennelId, user);
  res.json(forSalePets);
});

const setAsSold = asyncWrapper(async (req, res) => {
  const forSalePetId = req.params.forSalePetId as string;
  const userId = req.params.userId as string;
  const user = req.user;
  await ForSalePetService.setAsSold(user, forSalePetId, userId);
  res.status(204).end();
});

const setAsAvailable = asyncWrapper(async (req, res) => {
  const forSalePetId = req.params.forSalePetId as string;
  const userId = req.params.userId as string;
  const user = req.user;
  await ForSalePetService.setAsAvailable(user, forSalePetId, userId);
  res.status(204).end();
});

const like = asyncWrapper(async (req, res) => {
  const forSalePetId = req.params.forSalePetId as string;
  const userId = req.params.userId as string;
  const user = req.user;
  await ForSalePetService.like(user, forSalePetId, userId);
  res.status(204).end();
});

const unlike = asyncWrapper(async (req, res) => {
  const forSalePetId = req.params.forSalePetId as string;
  const userId = req.params.userId as string;
  const user = req.user;
  await ForSalePetService.unlike(user, forSalePetId, userId);
  res.status(204).end();
});

const getLikesCount = asyncWrapper(async (req, res) => {
  const forSalePetId = req.params.forSalePetId as string;
  const likesCount = await ForSalePetService.getLikesCount(forSalePetId);
  res.json(likesCount);
});

const isLikedByUser = asyncWrapper(async (req, res) => {
  const forSalePetId = req.params.forSalePetId as string;
  const userId = req.params.userId as string;
  const isLikedByUser = await ForSalePetService.isLikedByUser(forSalePetId, userId);
  res.json(isLikedByUser);
});

const ForSalePetController = { getAll, getAllFollowed, getOne, create, update, destroy, getRandom, getByKennelId, setAsSold, setAsAvailable, like, unlike, getLikesCount, isLikedByUser };
export default ForSalePetController;

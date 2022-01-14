import asyncWrapper from "../helpers/async-wrapper";
import StudService from "../services/stud.service";
import { CreateStudBody, UpdateStudBody } from "../types/request-body.types";

const getAll = asyncWrapper(async (req, res) => {
  const studs = await StudService.getAll(req.query, 20);
  res.json(studs);
});

const getAllFollowed = asyncWrapper(async (req, res) => {
  const userId = req.params.userId;
  const studs = await StudService.getAllFollowed(userId, req.query, 20);
  res.json(studs);
});

const getOne = asyncWrapper(async (req, res) => {
  const studId = req.params.studId as string;
  const stud = await StudService.getOne(studId);
  res.json(stud);
});

const create = asyncWrapper(async (req, res) => {
  const user = req.user;
  const kennelId = req.params.kennelId;
  const createStudBody = req.body as CreateStudBody;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const images = files.images;
  const stud = await StudService.create(createStudBody, images, kennelId, user);
  res.status(201).json(stud);
});

const update = asyncWrapper(async (req, res) => {
  const user = req.user;
  const studId = req.params.studId;
  const updateStudBody = req.body as UpdateStudBody;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const images = files.images;
  const stud = await StudService.update(updateStudBody, studId, user, images);
  res.json(stud);
});

const destroy = asyncWrapper(async (req, res) => {
  const user = req.user;
  const studId = req.params.studId;
  await StudService.destroy(studId, user);
  res.status(204).end();
});

const getRandom = asyncWrapper(async (req, res) => {
  const randomStuds = await StudService.getRandom(3);
  res.json(randomStuds);
});

const getByKennelId = asyncWrapper(async (req, res) => {
  const kennelId = req.params.kennelId as string;
  const user = req.user;
  const studs = await StudService.getByKennelId(kennelId, user);
  res.json(studs);
});

const like = asyncWrapper(async (req, res) => {
  const studId = req.params.studId as string;
  const userId = req.params.userId as string;
  const user = req.user;
  await StudService.like(user, studId, userId);
  res.status(204).end();
});

const unlike = asyncWrapper(async (req, res) => {
  const studId = req.params.studId as string;
  const userId = req.params.userId as string;
  const user = req.user;
  await StudService.unlike(user, studId, userId);
  res.status(204).end();
});

const getLikesCount = asyncWrapper(async (req, res) => {
  const studId = req.params.studId as string;
  const likesCount = await StudService.getLikesCount(studId);
  res.json(likesCount);
});

const isLikedByUser = asyncWrapper(async (req, res) => {
  const studId = req.params.studId as string;
  const userId = req.params.userId as string;
  const isLikedByUser = await StudService.isLikedByUser(studId, userId);
  res.json(isLikedByUser);
});

const StudController = { getAll, getAllFollowed, getOne, create, update, destroy, getRandom, getByKennelId, like, unlike, getLikesCount, isLikedByUser };
export default StudController;

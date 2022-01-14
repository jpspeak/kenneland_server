import createHttpError from "http-errors";
import { isValidObjectId } from "mongoose";
import paginate from "./../helpers/paginate";
import Stud from "../models/stud.model";
import { IUser } from "../models/user.model";
import config from "../config";
import _ from "lodash";
import { CreateStudBody, UpdateStudBody } from "../types/request-body.types";
import MediaService from "./media.service";
import mongoose from "mongoose";
import Kennel from "../models/kennel.model";
import StudLike from "../models/stud-like.model";
import KennelFollower from "../models/follower.model";

const getAll = async (urlQuery: any, perPage: number = 1) => {
  let query: { [key: string]: any } = {};

  if (urlQuery.cursor && typeof urlQuery.cursor === "string" && isValidObjectId(urlQuery.cursor)) {
    query._id = { $gt: new mongoose.Types.ObjectId(urlQuery.cursor) };
  }
  if (urlQuery.studName && typeof urlQuery.studName === "string") {
    query.name = new RegExp(urlQuery.studName, "i");
  }
  if (urlQuery.location && typeof urlQuery.location === "string") {
    query.location = new RegExp(urlQuery.location, "i");
  }
  if (urlQuery.breed) {
    query.breed = { $in: [].concat(urlQuery.breed) };
  }

  const studs = await Stud.aggregate([{ $match: query }, { $limit: perPage + 1 }, { $lookup: { from: "kennels", localField: "kennel", foreignField: "_id", as: "kennel" } }, { $unwind: "$kennel" }]);
  const results = studs.length > perPage ? studs.slice(0, -1) : studs;
  const cursor = studs.length > perPage ? studs[studs.length - 2]?._id : studs[studs.length - 1]?._id;
  const hasNext = studs.length > perPage;

  return {
    results,
    cursor,
    hasNext
  };
};

const getAllFollowed = async (userId: string, urlQuery: any, perPage: number = 1) => {
  let query: { [key: string]: any } = {};

  if (urlQuery.cursor && typeof urlQuery.cursor === "string" && isValidObjectId(urlQuery.cursor)) {
    query._id = { $gt: new mongoose.Types.ObjectId(urlQuery.cursor) };
  }

  const kennelFollowers = await KennelFollower.find({ user: new mongoose.Types.ObjectId(userId) });
  query.kennel = { $in: kennelFollowers.map(kennelFollower => kennelFollower.kennel) };

  const studs = await Stud.aggregate([{ $match: query }, { $limit: perPage + 1 }, { $lookup: { from: "kennels", localField: "kennel", foreignField: "_id", as: "kennel" } }, { $unwind: "$kennel" }]);
  const results = studs.length > perPage ? studs.slice(0, -1) : studs;
  const cursor = studs.length > perPage ? studs[studs.length - 2]?._id : studs[studs.length - 1]?._id;
  const hasNext = studs.length > perPage;

  return {
    results,
    cursor,
    hasNext
  };
};

const getOne = async (studId: string) => {
  if (!isValidObjectId(studId)) throw new createHttpError.NotFound();

  const stud = await Stud.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(studId) } },
    { $lookup: { from: "kennels", localField: "kennel", foreignField: "_id", as: "kennel" } },
    { $unwind: "$kennel" }
  ]);
  if (stud.length === 0) throw new createHttpError.NotFound();

  return stud[0];
};

const create = async (createStudBody: CreateStudBody, images: Express.Multer.File[], kennelId: string, user: IUser) => {
  if (!isValidObjectId(kennelId)) throw new createHttpError.NotFound();

  const kennel = await Kennel.findById(kennelId);
  if (!kennel) throw new createHttpError.NotFound();
  if (kennel.user.toString() !== user.id) throw new createHttpError.Forbidden();

  const stud = new Stud(createStudBody);

  const imageUrls = await Promise.all(
    images.map(async image => {
      const imageObjectKey = await MediaService.uploadImage(image.path, user.id);
      return config.aws.cloudfront.s3BaseUrl + "/" + imageObjectKey;
    })
  );
  stud.images = imageUrls;
  stud.user = user.id;
  stud.kennel = kennelId;

  const createdStud = await stud.save();
  return createdStud;
};

const update = async (updateStudBody: UpdateStudBody, studId: string, user: IUser, images?: Express.Multer.File[]) => {
  if (!isValidObjectId(studId)) throw new createHttpError.NotFound();

  const stud = await Stud.findById(studId);
  if (!stud) throw new createHttpError.NotFound();

  if (stud.user.toString() !== user.id) throw new createHttpError.Forbidden();

  stud.name = updateStudBody.name;
  stud.breed = updateStudBody.breed;
  stud.studFee = updateStudBody.studFee;
  stud.location = updateStudBody.location;
  stud.description = updateStudBody.description;

  const studImages = [...stud.images];

  if (updateStudBody.deleteImages) {
    for (const url of updateStudBody.deleteImages) {
      const objectKey = new URL(url).pathname.replace(/\//, "");
      await MediaService.deleteImage(objectKey);
      _.pull(studImages, url);
    }
  }

  if (images) {
    const imageUrls = await Promise.all(
      images.map(async image => {
        const imageObjectKey = await MediaService.uploadImage(image.path, user.id);
        return config.aws.cloudfront.s3BaseUrl + "/" + imageObjectKey;
      })
    );
    studImages.push(...imageUrls);
  }

  stud.images = studImages;

  const updatedStud = await stud.save();
  return updatedStud;
};

const destroy = async (studId: string, user: IUser) => {
  if (!isValidObjectId(studId)) throw new createHttpError.NotFound();

  const stud = await Stud.findById(studId);
  if (!stud) throw new createHttpError.NotFound();
  if (stud.user.toString() !== user.id) throw new createHttpError.Forbidden();

  for (const url of stud.images) {
    const objectKey = new URL(url).pathname.replace(/\//, "");
    await MediaService.deleteImage(objectKey);
  }

  await stud.remove();
  return true;
};

const getRandom = async (size: number) => {
  const randomStuds = await Stud.aggregate([{ $sample: { size } }]);
  return randomStuds;
};

const getByKennelId = async (kennelId: string, user?: IUser) => {
  if (!isValidObjectId(kennelId)) throw new createHttpError.NotFound();

  const studs = await Stud.aggregate([
    { $match: { kennel: new mongoose.Types.ObjectId(kennelId) } },
    { $lookup: { from: "kennels", localField: "kennel", foreignField: "_id", as: "kennel" } },
    { $unwind: "$kennel" }
  ]);

  return studs;
};

const like = async (user: IUser, studId: string, userId: string) => {
  if (!isValidObjectId(studId)) throw new createHttpError.NotFound();
  if (!isValidObjectId(userId)) throw new createHttpError.NotFound();
  if (userId !== user.id) throw new createHttpError.Forbidden();

  await StudLike.findOneAndUpdate({ user: new mongoose.Types.ObjectId(userId), stud: new mongoose.Types.ObjectId(studId) }, { user: userId, stud: studId }, { upsert: true });
  await Stud.findByIdAndUpdate(studId, { $inc: { likesCount: 1 } }, { upsert: true });
  return true;
};

const unlike = async (user: IUser, studId: string, userId: string) => {
  if (!isValidObjectId(studId)) throw new createHttpError.NotFound();
  if (!isValidObjectId(userId)) throw new createHttpError.NotFound();
  if (userId !== user.id) throw new createHttpError.Forbidden();

  await StudLike.findOneAndDelete({ user: new mongoose.Types.ObjectId(userId), stud: new mongoose.Types.ObjectId(studId) });
  await Stud.findByIdAndUpdate(studId, { $inc: { likesCount: -1 } });
  return true;
};

const getLikesCount = async (studId: string) => {
  if (!isValidObjectId(studId)) throw new createHttpError.NotFound();

  const likesCount = await StudLike.countDocuments({ stud: new mongoose.Types.ObjectId(studId) });
  return likesCount;
};

const isLikedByUser = async (studId: string, userId: string) => {
  if (!isValidObjectId(studId)) throw new createHttpError.NotFound();
  if (!isValidObjectId(userId)) throw new createHttpError.NotFound();
  const studLike = await StudLike.findOne({ user: new mongoose.Types.ObjectId(userId), stud: new mongoose.Types.ObjectId(studId) });
  if (studLike) return true;
  else return false;
};

const StudService = { getAll, getAllFollowed, getOne, create, update, destroy, getByKennelId, getRandom, like, unlike, getLikesCount, isLikedByUser };
export default StudService;

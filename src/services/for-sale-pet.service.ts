import createHttpError from "http-errors";
import { isValidObjectId } from "mongoose";
import config from "../config";
import paginate from "../helpers/paginate";
import ForSalePet from "../models/for-sale-pet.model";
import { IUser } from "../models/user.model";
import { CreateForSaleBody, UpdateForSaleBody } from "../types/request-body.types";
import MediaService from "./media.service";
import _ from "lodash";
import mongoose from "mongoose";
import Kennel from "../models/kennel.model";
import ForSalePetLike from "../models/for-sale-pet-like";
import KennelFollower from "../models/follower.model";

const getAll = async (urlQuery: any, perPage: number = 1) => {
  let query: { [key: string]: any } = {};

  if (urlQuery.cursor && typeof urlQuery.cursor === "string" && isValidObjectId(urlQuery.cursor)) {
    query._id = { $gt: new mongoose.Types.ObjectId(urlQuery.cursor) };
  }
  if (urlQuery.location && typeof urlQuery.studName === "string") {
    query.location = new RegExp(urlQuery.location, "i");
  }
  if (urlQuery.breed) {
    query.breed = { $in: [].concat(urlQuery.breed) };
  }
  if (urlQuery.sex && typeof urlQuery.sex === "string" && (urlQuery.sex === "Male" || urlQuery.sex === "Female")) {
    query.sex = urlQuery.sex;
  }

  if (urlQuery.minPrice && urlQuery.maxPrice) {
    query.price = { $gte: parseInt(urlQuery.minPrice), $lte: parseInt(urlQuery.maxPrice) };
  } else if (urlQuery.minPrice) {
    query.price = { $gte: parseInt(urlQuery.minPrice) };
  } else if (urlQuery.maxPrice) {
    query.price = { $lte: parseInt(urlQuery.maxPrice) };
  }

  query.sold = false;

  const forSalePets = await ForSalePet.aggregate([
    { $match: query },
    { $limit: perPage + 1 },
    { $lookup: { from: "kennels", localField: "kennel", foreignField: "_id", as: "kennel" } },
    { $unwind: "$kennel" }
  ]);
  const results = forSalePets.length > perPage ? forSalePets.slice(0, -1) : forSalePets;
  const cursor = forSalePets.length > perPage ? forSalePets[forSalePets.length - 2]?._id : forSalePets[forSalePets.length - 1]?._id;
  const hasNext = forSalePets.length > perPage;

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
  query.sold = false;

  const kennelFollowers = await KennelFollower.find({ user: new mongoose.Types.ObjectId(userId) });
  query.kennel = { $in: kennelFollowers.map(kennelFollower => kennelFollower.kennel) };

  const forSalePets = await ForSalePet.aggregate([
    { $match: query },
    { $limit: perPage + 1 },
    { $lookup: { from: "kennels", localField: "kennel", foreignField: "_id", as: "kennel" } },
    { $unwind: "$kennel" }
  ]);
  const results = forSalePets.length > perPage ? forSalePets.slice(0, -1) : forSalePets;
  const cursor = forSalePets.length > perPage ? forSalePets[forSalePets.length - 2]?._id : forSalePets[forSalePets.length - 1]?._id;
  const hasNext = forSalePets.length > perPage;

  return {
    results,
    cursor,
    hasNext
  };
};

const getOne = async (forSalePetId: string) => {
  if (!isValidObjectId(forSalePetId)) throw new createHttpError.NotFound();

  const forSalePet = await ForSalePet.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(forSalePetId) } },
    { $lookup: { from: "kennels", localField: "kennel", foreignField: "_id", as: "kennel" } },
    { $unwind: "$kennel" }
  ]);
  if (forSalePet.length === 0) throw new createHttpError.NotFound();

  return forSalePet[0];
};

const create = async (createForSaleBody: CreateForSaleBody, images: Express.Multer.File[], kennelId: string, user: IUser) => {
  if (!isValidObjectId(kennelId)) throw new createHttpError.NotFound();

  const kennel = await Kennel.findById(kennelId);
  if (!kennel) throw new createHttpError.NotFound();
  if (kennel.user.toString() !== user.id) throw new createHttpError.Forbidden();

  const forSale = new ForSalePet(createForSaleBody);

  const imageUrls = await Promise.all(
    images.map(async image => {
      const imageObjectKey = await MediaService.uploadImage(image.path, user.id);
      return config.aws.cloudfront.s3BaseUrl + "/" + imageObjectKey;
    })
  );
  forSale.images = imageUrls;
  forSale.user = user.id;
  forSale.kennel = kennelId;

  const createdForSale = await forSale.save();
  return createdForSale;
};

const update = async (updateForSaleBody: UpdateForSaleBody, forSalePetId: string, user: IUser, images?: Express.Multer.File[]) => {
  if (!isValidObjectId(forSalePetId)) throw new createHttpError.NotFound();
  const forSalePet = await ForSalePet.findById(forSalePetId);
  if (!forSalePet) throw new createHttpError.NotFound();

  if (forSalePet.user.toString() !== user.id) throw new createHttpError.Forbidden();

  forSalePet.breed = updateForSaleBody.breed;
  forSalePet.sex = updateForSaleBody.sex;
  forSalePet.dateOfBirth = updateForSaleBody.dateOfBirth;
  forSalePet.price = updateForSaleBody.price;
  forSalePet.location = updateForSaleBody.location;
  forSalePet.description = updateForSaleBody.description;

  const forSalePetImages = [...forSalePet.images];

  if (updateForSaleBody.deleteImages) {
    for (const url of updateForSaleBody.deleteImages) {
      const objectKey = new URL(url).pathname;
      await MediaService.deleteImage(objectKey);
      _.pull(forSalePetImages, url);
    }
  }

  if (images) {
    const imageUrls = await Promise.all(
      images.map(async image => {
        const imageObjectKey = await MediaService.uploadImage(image.path, user.id);
        return config.aws.cloudfront.s3BaseUrl + "/" + imageObjectKey;
      })
    );
    forSalePetImages.push(...imageUrls);
  }

  forSalePet.images = forSalePetImages;

  const updatedForSale = await forSalePet.save();
  return updatedForSale;
};

const destroy = async (forSalePetId: string, user: IUser) => {
  if (!isValidObjectId(forSalePetId)) throw new createHttpError.NotFound();

  const forSalePet = await ForSalePet.findById(forSalePetId);
  if (!forSalePet) throw new createHttpError.NotFound();

  if (forSalePet.user.toString() !== user.id) throw new createHttpError.Forbidden();

  for (const url of forSalePet.images) {
    const objectKey = new URL(url).pathname.replace(/\//, "");
    await MediaService.deleteImage(objectKey);
  }

  await forSalePet.remove();
  return true;
};

const getRandom = async (size: number) => {
  const randomForSalePets = await ForSalePet.aggregate([{ $match: { sold: false } }, { $sample: { size } }]);
  return randomForSalePets;
};

const getByKennelId = async (kennelId: string, user?: IUser) => {
  if (!isValidObjectId(kennelId)) throw new createHttpError.NotFound();

  const userId = user?._id;

  const forSalePets = await ForSalePet.aggregate([
    { $match: { kennel: new mongoose.Types.ObjectId(kennelId) } },
    { $lookup: { from: "kennels", localField: "kennel", foreignField: "_id", as: "kennel" } },
    { $unwind: "$kennel" }
  ]);

  return forSalePets;
};

const setAsSold = async (user: IUser, forSalePetId: string, userId: string) => {
  if (!isValidObjectId(forSalePetId)) throw new createHttpError.NotFound();
  if (!isValidObjectId(userId)) throw new createHttpError.NotFound();
  if (userId !== user.id) throw new createHttpError.Forbidden();

  const forSalePet = await ForSalePet.findById(forSalePetId);
  if (!forSalePet) throw new createHttpError.NotFound();

  forSalePet.sold = true;
  await forSalePet.save();

  return true;
};

const setAsAvailable = async (user: IUser, forSalePetId: string, userId: string) => {
  if (!isValidObjectId(forSalePetId)) throw new createHttpError.NotFound();
  if (!isValidObjectId(userId)) throw new createHttpError.NotFound();
  if (userId !== user.id) throw new createHttpError.Forbidden();

  const forSalePet = await ForSalePet.findById(forSalePetId);
  if (!forSalePet) throw new createHttpError.NotFound();

  forSalePet.sold = false;
  await forSalePet.save();

  return true;
};

const like = async (user: IUser, forSalePetId: string, userId: string) => {
  if (!isValidObjectId(forSalePetId)) throw new createHttpError.NotFound();
  if (!isValidObjectId(userId)) throw new createHttpError.NotFound();
  if (userId !== user.id) throw new createHttpError.Forbidden();

  await ForSalePetLike.findOneAndUpdate(
    { user: new mongoose.Types.ObjectId(userId), forSalePet: new mongoose.Types.ObjectId(forSalePetId) },
    { user: userId, forSalePet: forSalePetId },
    { upsert: true }
  );
  await ForSalePet.findByIdAndUpdate(forSalePetId, { $inc: { likesCount: 1 } }, { upsert: true });
  return true;
};

const unlike = async (user: IUser, forSalePetId: string, userId: string) => {
  if (!isValidObjectId(forSalePetId)) throw new createHttpError.NotFound();
  if (!isValidObjectId(userId)) throw new createHttpError.NotFound();
  if (userId !== user.id) throw new createHttpError.Forbidden();

  await ForSalePetLike.findOneAndDelete({ user: new mongoose.Types.ObjectId(userId), forSalePet: new mongoose.Types.ObjectId(forSalePetId) });
  await ForSalePet.findByIdAndUpdate(forSalePetId, { $inc: { likesCount: -1 } });
  return true;
};

const getLikesCount = async (forSalePetId: string) => {
  if (!isValidObjectId(forSalePetId)) throw new createHttpError.NotFound();

  const likesCount = await ForSalePetLike.countDocuments({ forSalePet: new mongoose.Types.ObjectId(forSalePetId) });
  return likesCount;
};

const isLikedByUser = async (forSalePetId: string, userId: string) => {
  if (!isValidObjectId(forSalePetId)) throw new createHttpError.NotFound();
  if (!isValidObjectId(userId)) throw new createHttpError.NotFound();
  const forSalePetLike = await ForSalePetLike.findOne({ user: new mongoose.Types.ObjectId(userId), forSalePet: new mongoose.Types.ObjectId(forSalePetId) });
  if (forSalePetLike) return true;
  else return false;
};

const ForSalePetService = { getAll, getAllFollowed, getOne, create, update, destroy, getRandom, getByKennelId, setAsSold, setAsAvailable, like, unlike, getLikesCount, isLikedByUser };
export default ForSalePetService;

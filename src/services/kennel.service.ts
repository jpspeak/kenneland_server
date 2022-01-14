import createHttpError from "http-errors";
import { isValidObjectId } from "mongoose";
import Kennel, { IKennel } from "../models/kennel.model";
import User, { IUser } from "../models/user.model";
import paginate from "../helpers/paginate";
import config from "../config";
import AWSS3Service from "./aws-s3.service";
import { CreateKennelBody, UpdateKennelBody } from "../types/request-body.types";
import MediaService from "./media.service";
import mongoose from "mongoose";
import KennelFollower from "../models/follower.model";

const getAll = async (urlQuery: any, perPage: number = 1) => {
  let query: { [key: string]: any } = {};

  if (urlQuery.cursor && typeof urlQuery.cursor === "string" && isValidObjectId(urlQuery.cursor)) {
    query._id = { $gt: new mongoose.Types.ObjectId(urlQuery.cursor) };
  }
  if (urlQuery.kennelName && typeof urlQuery.kennelName === "string") {
    query.name = new RegExp(urlQuery.kennelName, "i");
  }
  if (urlQuery.location && typeof urlQuery.location === "string") {
    query.location = new RegExp(urlQuery.location, "i");
  }
  if (urlQuery.breed) {
    query.breeds = { $in: [].concat(urlQuery.breed) };
  }

  const kennels = await Kennel.aggregate([{ $match: query }, { $limit: perPage + 1 }]);
  const results = kennels.length > perPage ? kennels.slice(0, -1) : kennels;
  const cursor = kennels.length > perPage ? kennels[kennels.length - 2]?._id : kennels[kennels.length - 1]?._id;
  const hasNext = kennels.length > perPage;

  return {
    results,
    cursor,
    hasNext
  };
};

const getOne = async (kennelId: string) => {
  if (!isValidObjectId(kennelId)) throw new createHttpError.NotFound();

  const kennel = await Kennel.findById(kennelId).populate("user");
  if (!kennel) throw new createHttpError.NotFound();

  return kennel;
};

const getYouMightLike = async (urlQuery: any, perPage: number = 1) => {
  let query: { [key: string]: any } = {};
  let userObjectId;
  let kennels: IKennel[];

  if (urlQuery.breed) {
    query.$text = {
      $search: [].concat(urlQuery.breed).join(" ")
    };
  }

  if (userObjectId) {
    kennels = await Kennel.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "kennelfollowers",
          let: { kennelId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$kennel", "$$kennelId"] }, { $eq: ["$user", userObjectId] }]
                }
              }
            }
          ],
          as: "matches"
        }
      },
      { $match: { matches: [], user: { $ne: userObjectId } } },
      {
        $project: {
          matches: 0
        }
      },
      { $sort: { score: { $meta: "textScore" } } },
      { $limit: perPage + 1 }
    ]);
  } else {
    kennels = await Kennel.aggregate([{ $match: query }, { $sort: { score: { $meta: "textScore" } } }, { $limit: perPage + 1 }]);
  }

  return kennels;
};

const create = async (user: IUser, userId: string, createKennelBody: CreateKennelBody, displayPicture: Express.Multer.File, banner: Express.Multer.File) => {
  if (!isValidObjectId(userId)) throw new createHttpError.NotFound();

  const _user = await User.findById(userId);
  if (!_user) throw new createHttpError.NotFound();

  if (_user.id !== user.id) throw new createHttpError.Forbidden();

  const existingKennel = await Kennel.findOne({ user: _user._id });
  if (existingKennel) throw new createHttpError.Forbidden();

  const newKennel = new Kennel();

  newKennel.user = _user.id;
  newKennel.name = createKennelBody.name;
  newKennel.description = createKennelBody.description;
  newKennel.breeds = createKennelBody.breeds;
  newKennel.location = createKennelBody.location;
  newKennel.email = createKennelBody.email;
  newKennel.mobileNumber = createKennelBody.mobileNumber;

  if (displayPicture) {
    const imageObjectKey = await MediaService.uploadImage(displayPicture.path, userId);
    const imageUrl = config.aws.cloudfront.s3BaseUrl + "/" + imageObjectKey;
    newKennel.displayPicture = imageUrl;
  }

  if (banner) {
    const imageObjectKey = await MediaService.uploadImage(banner.path, userId);
    const imageUrl = config.aws.cloudfront.s3BaseUrl + "/" + imageObjectKey;
    newKennel.banner = imageUrl;
  }

  const createdKennel = await newKennel.save();

  _user.kennel = createdKennel.id;
  await _user.save();

  return createdKennel;
};

const update = async (user: IUser, kennelId: string, updateKennelBody: UpdateKennelBody, displayPicture: Express.Multer.File, banner: Express.Multer.File) => {
  if (!isValidObjectId(kennelId)) throw new createHttpError.NotFound();

  const kennel = await Kennel.findById(kennelId);
  if (!kennel) throw new createHttpError.NotFound();

  if (kennel.user.toString() !== user.id) throw new createHttpError.Forbidden();

  if (displayPicture) {
    const objectKeyToDelete = kennel.displayPicture ? new URL(kennel.displayPicture).pathname : undefined;
    const displayPictureObjectKey = await MediaService.uploadImage(displayPicture.path, user.id, objectKeyToDelete);
    kennel.displayPicture = config.aws.cloudfront.s3BaseUrl + "/" + displayPictureObjectKey;
  }

  if (banner) {
    const objectKeyToDelete = kennel.banner ? new URL(kennel.banner).pathname : undefined;
    const bannerObjectKey = await MediaService.uploadImage(banner.path, user.id, objectKeyToDelete);
    kennel.banner = config.aws.cloudfront.s3BaseUrl + "/" + bannerObjectKey;
  }

  if (updateKennelBody.deleteBanner) {
    const bannerObjectKey = kennel.banner ? new URL(kennel.banner).pathname : undefined;
    if (bannerObjectKey) {
      await AWSS3Service.deleteFile(bannerObjectKey);
    }
    kennel.banner = undefined;
  }

  kennel.name = updateKennelBody.name;
  kennel.description = updateKennelBody.description;
  kennel.breeds = updateKennelBody.breeds;
  kennel.location = updateKennelBody.location;
  kennel.email = updateKennelBody.email;
  kennel.mobileNumber = updateKennelBody.mobileNumber;

  const updatedKennel = await kennel.save();
  return updatedKennel;
};

const getRandom = async (size: number) => {
  const kennels = await Kennel.aggregate([{ $sample: { size } }]);
  return kennels;
};

const getByUser = async (userId: string) => {
  if (!isValidObjectId(userId)) throw new createHttpError.NotFound();
  const kennel = await Kennel.findOne({ user: userId });
  return kennel;
};

const follow = async (user: IUser, kennelId: string, userId: string) => {
  if (!isValidObjectId(kennelId)) throw new createHttpError.NotFound();
  if (!isValidObjectId(userId)) throw new createHttpError.NotFound();
  if (userId !== user.id) throw new createHttpError.Forbidden();

  await KennelFollower.findOneAndUpdate({ user: new mongoose.Types.ObjectId(userId), kennel: new mongoose.Types.ObjectId(kennelId) }, { user: userId, kennel: kennelId }, { upsert: true });
  await Kennel.findByIdAndUpdate(kennelId, { $inc: { likesCount: 1 } }, { upsert: true });
  return true;
};

const unfollow = async (user: IUser, kennelId: string, userId: string) => {
  if (!isValidObjectId(kennelId)) throw new createHttpError.NotFound();
  if (!isValidObjectId(userId)) throw new createHttpError.NotFound();
  if (userId !== user.id) throw new createHttpError.Forbidden();

  await KennelFollower.findOneAndDelete({ user: new mongoose.Types.ObjectId(userId), stud: new mongoose.Types.ObjectId(kennelId) });
  await Kennel.findByIdAndUpdate(kennelId, { $inc: { likesCount: -1 } });
  return true;
};

const isFollowedByUser = async (kennelId: string, userId: string) => {
  if (!isValidObjectId(kennelId)) throw new createHttpError.NotFound();
  if (!isValidObjectId(userId)) throw new createHttpError.NotFound();
  const kennelFollower = await KennelFollower.findOne({ user: new mongoose.Types.ObjectId(userId), kennel: new mongoose.Types.ObjectId(kennelId) });
  if (kennelFollower) return true;
  else return false;
};

const KennelService = { getAll, getOne, getYouMightLike, create, update, getRandom, getByUser, follow, unfollow, isFollowedByUser };
export default KennelService;

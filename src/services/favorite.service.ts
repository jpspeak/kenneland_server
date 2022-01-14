import Stud from "../models/stud.model";
import UserData from "../models/user-data.model";
import mongoose from "mongoose";

const getFavoriteStudsByUser = async (userId: string) => {
  const _userId = new mongoose.Types.ObjectId(userId);

  const userData = await UserData.findOne({ user: userId });

  const favoriteStuds = await Stud.aggregate([
    { $match: { _id: { $in: userData?.favoriteStuds } } },
    { $lookup: { from: "kennels", localField: "kennel", foreignField: "_id", as: "kennel" } },
    { $unwind: "$kennel" },
    { $addFields: { favoriteByCount: { $size: "$favoriteBy" }, isFavorite: { $cond: [{ $in: [_userId, "$favoriteBy"] }, true, false] } } }
  ]);

  return favoriteStuds;
};

const getFavoriteForSaleByUser = async (userId: string) => {
  const _userId = new mongoose.Types.ObjectId(userId);

  const userData = await UserData.findOne({ user: userId });

  const favoriteForSale = await Stud.aggregate([
    { $match: { _id: { $in: userData?.favoriteForSale } } },
    { $addFields: { favoriteByCount: { $size: "$favoriteBy" }, isFavorite: { $cond: [{ $in: [_userId, "$favoriteBy"] }, true, false] } } }
  ]);

  return favoriteForSale;
};

const addToFavoriteStuds = async (studId: string, userId: string) => {
  await UserData.updateOne({ user: userId }, { $addToSet: { favoriteStuds: studId } }, { upsert: true });
  await Stud.updateOne({ _id: studId }, { $addToSet: { favoriteBy: userId } });
  return true;
};

const removeFromFavoriteStuds = async (studId: string, userId: string) => {
  await UserData.updateOne({ user: userId }, { $pull: { favoriteStuds: studId } });
  await Stud.updateOne({ _id: studId }, { $pull: { favoriteBy: userId } });
  return true;
};

const addToFavoriteForSale = async (studId: string, userId: string) => {
  await UserData.updateOne({ user: userId }, { $addToSet: { favoriteStuds: studId } }, { upsert: true });
  await Stud.updateOne({ _id: studId }, { $addToSet: { favoriteBy: userId } });
  return true;
};

const removeFromFavoriteForSale = async (studId: string, userId: string) => {
  await UserData.updateOne({ user: userId }, { $pull: { favoriteStuds: { stud: studId } } });
  await Stud.updateOne({ _id: studId }, { $pull: { favoriteBy: userId } });
  return true;
};

const isStudFavoriteByUser = async (studId: string, userId: string) => {
  const userData = await UserData.findOne({ user: userId });
  const isFavorite = userData?.favoriteStuds.includes(studId);
  return isFavorite;
};

const FavoriteStudService = { getFavoriteStudsByUser, getFavoriteForSaleByUser, addToFavoriteStuds, removeFromFavoriteStuds, addToFavoriteForSale, removeFromFavoriteForSale, isStudFavoriteByUser };
export default FavoriteStudService;

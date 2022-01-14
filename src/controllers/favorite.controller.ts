import asyncWrapper from "../helpers/async-wrapper";
import FavoriteStudService from "../services/favorite.service";

const getFavoriteStudsByUser = asyncWrapper(async (req, res) => {
  const userId = req.user._id;
  const favoriteStuds = await FavoriteStudService.getFavoriteStudsByUser(userId);
  res.json(favoriteStuds);
});

const getFavoriteForSaleByUser = asyncWrapper(async (req, res) => {
  const userId = req.user._id;
  const favoriteForSale = await FavoriteStudService.getFavoriteForSaleByUser(userId);
  res.json(favoriteForSale);
});

const addToFavoriteStuds = asyncWrapper(async (req, res) => {
  const studId = req.params.studId;
  const userId = req.user._id;
  const favoriteStud = await FavoriteStudService.addToFavoriteStuds(studId, userId);
  res.json(favoriteStud);
});

const removeFromFavoriteStuds = asyncWrapper(async (req, res) => {
  const studId = req.params.studId;
  const userId = req.user._id;
  await FavoriteStudService.removeFromFavoriteStuds(studId, userId);
  res.status(204).end();
});

const addToFavoriteForSale = asyncWrapper(async (req, res) => {
  const studId = req.params.studId;
  const userId = req.user._id;
  const favoriteForSale = await FavoriteStudService.addToFavoriteForSale(studId, userId);
  res.json(favoriteForSale);
});

const removeFromFavoriteForSale = asyncWrapper(async (req, res) => {
  const studId = req.params.studId;
  const userId = req.user._id;
  await FavoriteStudService.removeFromFavoriteForSale(studId, userId);
  res.status(204).end();
});

const isStudFavoriteByUser = asyncWrapper(async (req, res) => {
  const studId = req.params.studId;
  const userId = req.user._id;
  const isFavorite = await FavoriteStudService.isStudFavoriteByUser(studId, userId);
  res.json(isFavorite);
});

const FavoriteStudController = { getFavoriteStudsByUser, getFavoriteForSaleByUser, addToFavoriteStuds, removeFromFavoriteStuds, addToFavoriteForSale, removeFromFavoriteForSale, isStudFavoriteByUser };
export default FavoriteStudController;

import express from "express";
import FavoriteController from "../controllers/favorite.controller";
import checkAuth from "../middlewares/check-auth";
import requireAuth from "../middlewares/require-auth";
const router = express.Router();

router.get("/favorite-studs", checkAuth, requireAuth, FavoriteController.getFavoriteStudsByUser);
router.get("/favorite-studs/:studId/is-favorite", checkAuth, requireAuth, FavoriteController.isStudFavoriteByUser);
router.get("/favorite-for-sale", FavoriteController.getFavoriteForSaleByUser);
router.put("/add-to-favorite-studs", checkAuth, requireAuth, FavoriteController.addToFavoriteStuds);
router.put("/remove-from-favorite-studs", checkAuth, requireAuth, FavoriteController.removeFromFavoriteStuds);
router.put("/add-to-favorite-for-sale", checkAuth, requireAuth, FavoriteController.addToFavoriteForSale);
router.put("/remove-from-favorite-for-sale", checkAuth, requireAuth, FavoriteController.removeFromFavoriteForSale);

export default router;

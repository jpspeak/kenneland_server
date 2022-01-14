import express from "express";
import ForSalePetController from "../controllers/for-sale-pet.controller";
import checkAuth from "../middlewares/check-auth";
import requireAuth from "../middlewares/require-auth";
import ForSalePetValidation from "../validations/for-sale-pet.validation";
const router = express.Router();

router.get("/for-sale-pets/random", ForSalePetController.getRandom);

router.get("/for-sale-pets", ForSalePetController.getAll);
router.get("/for-sale-pets/:forSalePetId", checkAuth, ForSalePetController.getOne);
router.post("/kennels/:kennelId/for-sale-pets", checkAuth, requireAuth, ForSalePetValidation.create, ForSalePetController.create);
router.put("/for-sale-pets/:forSalePetId", checkAuth, requireAuth, ForSalePetValidation.update, ForSalePetController.update);
router.delete("/for-sale-pets/:forSalePetId", checkAuth, requireAuth, ForSalePetController.destroy);

router.get("/kennels/:kennelId/for-sale-pets", checkAuth, ForSalePetController.getByKennelId);

router.post("/users/:userId/for-sale-pets/:forSalePetId/set-as-sold", checkAuth, requireAuth, ForSalePetController.setAsSold);
router.post("/users/:userId/for-sale-pets/:forSalePetId/set-as-available", checkAuth, requireAuth, ForSalePetController.setAsAvailable);

router.post("/users/:userId/for-sale-pets/:forSalePetId/like", checkAuth, requireAuth, ForSalePetController.like);
router.post("/users/:userId/for-sale-pets/:forSalePetId/unlike", checkAuth, requireAuth, ForSalePetController.unlike);
router.get("/for-sale-pets/:forSalePetId/likes-count", ForSalePetController.getLikesCount);
router.get("/users/:userId/for-sale-pets/:forSalePetId/is-liked", ForSalePetController.isLikedByUser);

router.get("/users/:userId/feed/for-sale-pets", ForSalePetController.getAllFollowed);

export default router;

import express from "express";
import KennelController from "../controllers/kennel.controller";
import checkAuth from "../middlewares/check-auth";
import requireAuth from "../middlewares/require-auth";
import KennelValidation from "../validations/kennel.validation";
const router = express.Router();

router.get("/kennels/random", KennelController.getRandom);
router.get("/kennels/you-might-like", KennelController.getYouMightLike);

router.get("/kennels/", KennelController.getAll);
router.get("/kennels/:kennelId", KennelController.getOne);
router.post("/users/:userId/kennels", checkAuth, requireAuth, KennelValidation.create, KennelController.create);
router.put("/kennels/:kennelId", checkAuth, requireAuth, KennelValidation.update, KennelController.update);

router.post("/users/:userId/kennels/:kennelId/follow", checkAuth, requireAuth, KennelController.follow);
router.post("/users/:userId/kennels/:kennelId/unfollow", checkAuth, requireAuth, KennelController.unfollow);
router.get("/users/:userId/kennels/:kennelId/is-followed", KennelController.isFollowedByUser);

export default router;

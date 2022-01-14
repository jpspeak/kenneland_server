import express from "express";
import StudController from "../controllers/stud.controller";
import checkAuth from "../middlewares/check-auth";
import requireAuth from "../middlewares/require-auth";
import StudValidation from "../validations/stud.validation";
const router = express.Router();

router.get("/studs/random", StudController.getRandom);

router.get("/studs", StudController.getAll);
router.get("/studs/:studId", checkAuth, StudController.getOne);
router.post("/kennels/:kennelId/studs", checkAuth, requireAuth, StudValidation.create, StudController.create);
router.put("/studs/:studId", checkAuth, requireAuth, StudValidation.update, StudController.update);
router.delete("/studs/:studId", checkAuth, requireAuth, StudController.destroy);

router.get("/kennels/:kennelId/studs", checkAuth, StudController.getByKennelId);

router.post("/users/:userId/studs/:studId/like", checkAuth, requireAuth, StudController.like);
router.post("/users/:userId/studs/:studId/unlike", checkAuth, requireAuth, StudController.unlike);
router.get("/studs/:studId/likes-count", StudController.getLikesCount);
router.get("/users/:userId/studs/:studId/is-liked", StudController.isLikedByUser);

router.get("/users/:userId/feed/studs", StudController.getAllFollowed);
export default router;

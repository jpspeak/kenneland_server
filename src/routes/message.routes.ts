import express from "express";
import MessageController from "../controllers/message.controller";
import checkAuth from "../middlewares/check-auth";
import requireAuth from "../middlewares/require-auth";
import MessageValidation from "../validations/message.validation";
const router = express.Router();

router.get("/conversations/:conversationId/messages", checkAuth, requireAuth, MessageController.getByConversationId);
router.get("/messages/memberSelfId/:memberSelfId/memberId/:memberId", checkAuth, requireAuth, MessageController.getByMembersId);
router.post("/messages", checkAuth, requireAuth, MessageValidation.create, MessageController.create);
router.post("/conversations/:conversationId/messages", checkAuth, requireAuth, MessageValidation.createByConversationId, MessageController.createByConversationId);

export default router;

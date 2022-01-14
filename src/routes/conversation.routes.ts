import express from "express";
import ConversationController from "../controllers/conversation.controller";
import checkAuth from "../middlewares/check-auth";
import requireAuth from "../middlewares/require-auth";
import ConversationValidation from "../validations/conversation.validation";
const router = express.Router();

router.get("/users/:userId/conversations", checkAuth, requireAuth, ConversationController.getByUserId);
router.get("/kennels/:kennelId/conversations", checkAuth, requireAuth, ConversationController.getByKennelId);
router.post("/users/:userId/conversations", checkAuth, requireAuth, ConversationValidation.create, ConversationController.create);
router.get("/users/:userId/conversations/unseen-count", checkAuth, requireAuth, ConversationController.getUnseenConversationCount);
router.post("/conversations/:conversationId/seenBy/:memberId", checkAuth, requireAuth, ConversationController.seeConversation);
router.get("/users/:userId/conversations/receiver/:receiverId", checkAuth, requireAuth, ConversationValidation.getByAvailableTo, ConversationController.getByAvailableTo);
router.delete("/conversations/:conversationId/memberId/:memberId", checkAuth, requireAuth, ConversationController.removeByMemberId);
router.delete("/kennels/:kennelId/conversations/:conversationId", checkAuth, requireAuth, ConversationController.removeByKennelId);

export default router;

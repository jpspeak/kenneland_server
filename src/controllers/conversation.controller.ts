import asyncWrapper from "../helpers/async-wrapper";
import ConversationService from "../services/conversation.service";
import { CreateConversationBody } from "../types/request-body.types";

// const respond = (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
//   socket.on("joinRoom", data => {
//     socket.join(data);
//   });
//   socket.on("sendMessage", data => {
//     console.log("message sent");
//     socket.to(data.room).emit("receivedMessage", data);
//   });
//   socket.on("disconnect", () => {
//     // console.log("User " + socket.id + " disconnected.");
//   });
// };

const getByAvailableTo = asyncWrapper(async (req, res) => {
  const user = req.user;
  const senderId = req.params.userId;
  const receiverId = req.params.receiverId;
  const conversation = await ConversationService.getByAvailableTo(user, senderId, receiverId);
  res.json(conversation);
});

const getByUserId = asyncWrapper(async (req, res) => {
  const user = req.user;
  const userId = req.params.userId;
  const next = req.query.next as string;
  const conversations = await ConversationService.getByUserId(user, userId, next);
  res.json(conversations);
});

const getByKennelId = asyncWrapper(async (req, res) => {
  const user = req.user;
  const kennelId = req.params.kennelId;
  const next = req.query.next as string;
  const conversations = await ConversationService.getByKennelId(user, kennelId, next);
  res.json(conversations);
});

const create = asyncWrapper(async (req, res) => {
  const user = req.user;
  const userId = req.params.userId;
  const createConversationBody = req.body as CreateConversationBody;
  const createdConversation = await ConversationService.create(createConversationBody, userId, user);
  res.status(201).json(createdConversation);
});

const seeConversation = asyncWrapper(async (req, res) => {
  const user = req.user;
  const memberId = req.params.memberId;
  const conversationId = req.params.conversationId;
  const seenConversation = await ConversationService.seeConversation(conversationId, memberId, user);
  res.json(seenConversation);
});

const getUnseenConversationCount = asyncWrapper(async (req, res) => {
  const user = req.user;
  const userId = req.params.userId;
  const unseenConversationCount = await ConversationService.getUnseenConversationCount(userId, user);
  res.json(unseenConversationCount);
});

const removeByMemberId = asyncWrapper(async (req, res) => {
  const user = req.user;
  const memberId = req.params.memberId;
  const conversationId = req.params.conversationId;
  const conversations = await ConversationService.removeByMemberId(user, conversationId, memberId);
  res.json(conversations);
});

const removeByKennelId = asyncWrapper(async (req, res) => {
  const user = req.user;
  const kennelId = req.params.kennelId;
  const conversationId = req.params.conversationId;
  const conversations = await ConversationService.removeByKennelId(user, conversationId, kennelId);
  res.json(conversations);
});

const ConversationController = { create, getByUserId, getByKennelId, seeConversation, getUnseenConversationCount, getByAvailableTo, removeByMemberId, removeByKennelId };
export default ConversationController;

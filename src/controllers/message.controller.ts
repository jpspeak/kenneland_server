import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import asyncWrapper from "../helpers/async-wrapper";
import MessageService from "../services/message.service";
import { CreateMessageBody, CreateMessageByConversationIdBody } from "../types/request-body.types";
import isPositiveInteger from "../utils/is-positive-integer";

const create = asyncWrapper(async (req, res) => {
  const user = req.user;
  const createMessageBody = req.body as CreateMessageBody;

  const createdMessage = await MessageService.create(user, createMessageBody);
  res.status(201).json(createdMessage);
});

const createByConversationId = asyncWrapper(async (req, res) => {
  const user = req.user;
  const createMessageByConversationIdBody = req.body as CreateMessageByConversationIdBody;
  const conversationId = req.params.conversationId;
  const createdMessage = await MessageService.createByConversationId(user, conversationId, createMessageByConversationIdBody);
  res.status(201).json(createdMessage);
});

const getByConversationId = asyncWrapper(async (req, res) => {
  const user = req.user;
  // const next = isPositiveInteger(req.query.next) ? parseInt(req.query.next as string) : undefined;
  const next = req.query.next as string;
  const conversationId = req.params.conversationId;
  const messages = await MessageService.getByConversationId(conversationId, user, next);
  res.json(messages);
});
const getByMembersId = asyncWrapper(async (req, res) => {
  const user = req.user;
  const next = req.query.next as string;
  const memberSelfId = req.params.memberSelfId;
  const memberId = req.params.memberId;
  const messages = await MessageService.getByMembersId(user, memberSelfId, memberId, next);
  res.json(messages);
});

const MessageController = { create, getByConversationId, createByConversationId, getByMembersId };
export default MessageController;

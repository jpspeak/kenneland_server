import createHttpError from "http-errors";
import Conversation from "../models/conversation.model";
import Message from "../models/message.model";
import { IUser } from "../models/user.model";
import { CreateConversationBody } from "../types/request-body.types";
import mongoose from "mongoose";

const create = async (createConversationBody: CreateConversationBody, userId: string, user: IUser) => {
  if (userId !== user.id) throw new createHttpError.Forbidden();

  // const existingConversation = await Conversation.findOne({ members: [userId, createConversationBody.receiverId] });
  // if (existingConversation) throw new createHttpError.Conflict();

  const conversation = new Conversation({
    members: [userId, createConversationBody.receiverId]
  });

  const createdConversation = await conversation.save();
  return createdConversation;
};

const getByAvailableTo = async (user: IUser, senderId: string, receiverId: string) => {
  if (senderId !== user.id) throw new createHttpError.Forbidden();
  const conversation = await Conversation.findOne({ availableTo: { $all: [senderId, receiverId] } });
  return conversation;
};

// const getByUserId = async (userId: string, user: IUser) => {
//   if (userId !== user.id) throw new createHttpError.Forbidden();

//   // const conversations = await Conversation.find({ members: { $in: [userId] } }).populate("members", "firstName lastName");

//   const conversations = await Conversation.aggregate([
//     { $match: { members: { $in: [new mongoose.Types.ObjectId(userId)] } } },
//     { $lookup: { from: "users", localField: "members", foreignField: "_id", as: "members" } },
//     { $lookup: { from: "messages", localField: "latestMessage", foreignField: "_id", as: "latestMessage" } },
//     { $unwind: "$latestMessage" }
//   ]);
//   return conversations;
// };
const getByUserId = async (user: IUser, userId: string, next: string) => {
  if (userId !== user.id) throw new createHttpError.Forbidden();
  const kennelId = user.kennel;

  const limit = 2;
  let _next;
  let query = { availableTo: { $in: [new mongoose.Types.ObjectId(userId), kennelId] } } as any;

  const nextDate = new Date(parseInt(next));

  if (next && nextDate instanceof Date && !isNaN(nextDate.valueOf())) {
    query = { updatedAt: { $lte: nextDate }, availableTo: { $in: [new mongoose.Types.ObjectId(userId), kennelId] } };
  }

  // const conversations = await Conversation.aggregate([
  //   { $match: query },
  //   { $lookup: { from: "users", localField: "members", foreignField: "_id", as: "members" } },
  //   // { $lookup: { from: "messages", localField: "latestMessage", foreignField: "_id", as: "latestMessage" } },
  //   // { $unwind: "$latestMessage" },
  //   { $sort: { updatedAt: -1 } },
  //   { $limit: limit + 1 }
  // ]);
  const conversations = await Conversation.find(query)
    .sort({ updatedAt: -1 })
    .limit(limit + 1)
    .populate({ path: "members.data" });

  if (conversations.length > limit) {
    _next = conversations[conversations.length - 1].updatedAt;
    _next = (_next as Date).getTime();
    conversations.pop();
  }

  return { conversations, next: _next };

  // const limit = 10;
  // let _next;
  // let query = { members: { $in: [new mongoose.Types.ObjectId(userId)] } } as any;

  // if (next) {
  //   query = { _id: { $lte: new mongoose.Types.ObjectId(next) }, conversation: conversationId };
  // }

  // const messages = await Message.find(query)
  //   .sort({ createdAt: -1 })
  //   .limit(limit + 1)
  //   .populate("sender");

  // if (messages.length > limit) {
  //   _next = messages[messages.length - 1].id;
  //   messages.pop();
  // }

  // return { messages, next: _next };
};
const getByKennelId = async (user: IUser, kennelId: string, next: string) => {
  if (kennelId !== user.kennel?.toString()) throw new createHttpError.Forbidden();

  const limit = 1;
  let _next;
  let query = { availableTo: { $in: [new mongoose.Types.ObjectId(kennelId)] } } as any;

  const nextDate = new Date(parseInt(next));

  if (next && nextDate instanceof Date && !isNaN(nextDate.valueOf())) {
    query = { updatedAt: { $lte: nextDate }, availableTo: { $in: [new mongoose.Types.ObjectId(kennelId)] } };
  }

  const conversations = await Conversation.aggregate([
    { $match: query },
    // { $lookup: { from: "users", localField: "members", foreignField: "_id", as: "members" } },
    // { $lookup: { from: "messages", localField: "latestMessage", foreignField: "_id", as: "latestMessage" } },
    // { $unwind: "$latestMessage" },
    { $sort: { updatedAt: -1 } },
    { $limit: limit + 1 }
  ]);

  if (conversations.length > limit) {
    _next = conversations[conversations.length - 1].updatedAt;
    _next = (_next as Date).getTime();
    conversations.pop();
  }

  return { conversations, next: _next };

  // const limit = 10;
  // let _next;
  // let query = { members: { $in: [new mongoose.Types.ObjectId(userId)] } } as any;

  // if (next) {
  //   query = { _id: { $lte: new mongoose.Types.ObjectId(next) }, conversation: conversationId };
  // }

  // const messages = await Message.find(query)
  //   .sort({ createdAt: -1 })
  //   .limit(limit + 1)
  //   .populate("sender");

  // if (messages.length > limit) {
  //   _next = messages[messages.length - 1].id;
  //   messages.pop();
  // }

  // return { messages, next: _next };
};

const removeByKennelId = async (user: IUser, conversationId: string, kennelId: string) => {
  if (kennelId !== user.kennel?.toString()) throw new createHttpError.Forbidden();

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new createHttpError.NotFound();

  if (!conversation.availableTo.includes(kennelId)) throw new createHttpError.Forbidden();

  const newAvailableTo = conversation.availableTo.filter(member => member.toString() !== kennelId);
  if (newAvailableTo.length > 0) {
    conversation.availableTo = newAvailableTo;
    await conversation.save();

    await Message.updateMany({ conversation: new mongoose.Types.ObjectId(conversationId), availableTo: { $in: [new mongoose.Types.ObjectId(kennelId)] } }, { availableTo: newAvailableTo });
    await Message.deleteMany({ conversation: new mongoose.Types.ObjectId(conversationId), availableTo: [] });

    return true;
  }
  await Conversation.deleteOne({ _id: conversationId });
  await Message.deleteMany({ conversation: new mongoose.Types.ObjectId(conversationId) });
  return true;
};
const removeByMemberId = async (user: IUser, conversationId: string, memberId: string) => {
  if (!(memberId === user.id || user.kennel?.toString())) throw new createHttpError.Forbidden();

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new createHttpError.NotFound();

  if (!conversation.availableTo.includes(memberId)) throw new createHttpError.Forbidden();

  const newAvailableTo = conversation.availableTo.filter(member => member.toString() !== memberId);
  if (newAvailableTo.length > 0) {
    conversation.availableTo = newAvailableTo;
    await conversation.save();

    await Message.updateMany({ conversation: new mongoose.Types.ObjectId(conversationId), availableTo: { $in: [new mongoose.Types.ObjectId(memberId)] } }, { availableTo: newAvailableTo });
    await Message.deleteMany({ conversation: new mongoose.Types.ObjectId(conversationId), availableTo: [] });

    return true;
  }
  await Conversation.deleteOne({ _id: conversationId });
  await Message.deleteMany({ conversation: new mongoose.Types.ObjectId(conversationId) });
  return true;
};

const seeConversation = async (conversationId: string, memberId: string, user: IUser) => {
  if (!(memberId === user.id || memberId === user.kennel?.toString())) throw new createHttpError.Forbidden();

  // const conversations = await Conversation.find({ members: { $in: [userId] } }).populate("members", "firstName lastName");

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new createHttpError.NotFound();

  if (!conversation.membersSeen.some(_memberId => _memberId.toString() === memberId)) {
    conversation.membersSeen = [...conversation.membersSeen, memberId];
    await conversation.save();
  }

  return true;
};

const getUnseenConversationCount = async (userId: string, user: IUser) => {
  if (userId !== user.id) throw new createHttpError.Forbidden();
  const availableTo = user.kennel ? { $in: [new mongoose.Types.ObjectId(userId), user.kennel] } : { $in: [new mongoose.Types.ObjectId(userId)] };
  const membersSeen = user.kennel ? { $nin: [new mongoose.Types.ObjectId(userId), user.kennel] } : { $nin: [new mongoose.Types.ObjectId(userId)] };
  const unseenConversationsCount = await Conversation.find({ availableTo, membersSeen }).count();
  return unseenConversationsCount;
};

const ConversationService = { create, getByUserId, getByKennelId, seeConversation, getUnseenConversationCount, getByAvailableTo, removeByMemberId, removeByKennelId };
export default ConversationService;

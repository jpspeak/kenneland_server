import createHttpError from "http-errors";
import { isValidObjectId } from "mongoose";
import Conversation from "../models/conversation.model";
import Message from "../models/message.model";
import User, { IUser } from "../models/user.model";
import { CreateMessageBody, CreateMessageByConversationIdBody } from "../types/request-body.types";
import mongoose from "mongoose";
import Kennel from "../models/kennel.model";

const _create = async (user: IUser, createMessageBody: CreateMessageBody) => {
  const senderId = createMessageBody.senderId;
  const receiverId = createMessageBody.receiverId;
  const messageBody = createMessageBody.messageBody;

  if (!isValidObjectId(senderId)) throw new createHttpError.NotFound();
  if (!isValidObjectId(receiverId)) throw new createHttpError.NotFound();
  if (senderId !== user.id) throw new createHttpError.Forbidden();

  let createdMessage;
  let newConversation;

  const existingConversation = await Conversation.findOne({
    members: { $all: [{ $elemMatch: { data: new mongoose.Types.ObjectId(senderId) } }, { $elemMatch: { data: new mongoose.Types.ObjectId(receiverId) } }] }
  });

  if (existingConversation) {
    const newAvailableTo = existingConversation.availableTo.some(member => member.toString() === senderId) ? existingConversation.availableTo : [...existingConversation.availableTo, senderId];
    existingConversation.availableTo = newAvailableTo;
    const updatedExistingConversation = await existingConversation.save();
    newConversation = updatedExistingConversation;
  } else {
    const senderUser = await User.findOne({ _id: senderId });
    const receiverKennel = await Kennel.findOne({ _id: receiverId });

    if (!senderUser || !receiverKennel) throw new createHttpError.NotFound();

    const _newConversation = new Conversation();
    _newConversation.availableTo = [senderId, receiverId];
    _newConversation.members = [
      { data: senderId, type: "User" },
      { data: receiverId, type: "Kennel" }
    ];
    newConversation = await _newConversation.save();
  }

  const message = new Message({
    conversation: newConversation.id,
    messageBody,
    sender: senderId,
    senderType: "User",
    availableTo: newConversation.availableTo
  });
  createdMessage = await message.save();

  newConversation.membersSeen = [senderId];
  newConversation.updatedAt = new Date();
  newConversation.latestMessage = {
    senderId,
    messageBody
  };
  await newConversation.save();
  await createdMessage.populate([{ path: "conversation", select: "members latestMessage updatedAt", populate: [{ path: "members.data" }] }, { path: "sender" }]);

  return createdMessage;
};

const create = async (user: IUser, createMessageBody: CreateMessageBody) => {
  const senderId = createMessageBody.senderId;
  const receiverId = createMessageBody.receiverId;
  const messageBody = createMessageBody.messageBody;
  //Check if there's an existing conversation
  if (!isValidObjectId(senderId)) throw new createHttpError.NotFound();
  if (!isValidObjectId(receiverId)) throw new createHttpError.NotFound();

  const existingConversation = await Conversation.findOne({
    members: { $all: [{ $elemMatch: { data: new mongoose.Types.ObjectId(senderId) } }, { $elemMatch: { data: new mongoose.Types.ObjectId(receiverId) } }] }
  });

  //If no conversation yet
  if (!existingConversation) {
    //Sender must be user
    const sender = await User.findById(senderId);
    if (!sender) throw new createHttpError.Forbidden();

    //Sender must be the current user
    if (senderId !== user.id) throw new createHttpError.Forbidden();

    //Receiver must be kennel
    const receiver = await Kennel.findById(receiverId);
    if (!receiver) throw new createHttpError.Forbidden();

    //Create conversation
    const newConversation = new Conversation();
    newConversation.availableTo = [senderId, receiverId];
    newConversation.members = [
      { data: senderId, type: "User" },
      { data: receiverId, type: "Kennel" }
    ];
    const createdConversation = await newConversation.save();

    //Create message
    const newMessage = new Message({
      conversation: createdConversation.id,
      messageBody,
      sender: senderId,
      senderType: "User",
      availableTo: newConversation.availableTo
    });
    const createdMessage = await newMessage.save();

    //Update conversation
    createdConversation.membersSeen = [senderId];
    createdConversation.updatedAt = new Date();
    createdConversation.latestMessage = {
      senderId,
      messageBody
    };

    await createdConversation.save();
    await createdMessage.populate([{ path: "conversation", select: "members latestMessage membersSeen updatedAt", populate: [{ path: "members.data" }] }, { path: "sender" }]);
    return createdMessage;
  } else {
    //if with conversation

    //Sender must be the current user or user's kennel
    if (!(senderId === user.id || senderId === user.kennel?.toString())) throw new createHttpError.Forbidden();

    //Find sender
    const sender = existingConversation.members.find(member => member.data.toString() === senderId);
    if (!sender) throw new createHttpError.NotFound();

    //Create message
    const newMessage = new Message({
      conversation: existingConversation.id,
      messageBody,
      sender: senderId,
      senderType: sender.type,
      availableTo: [senderId, receiverId]
    });
    const createdMessage = await newMessage.save();

    //Update conversation
    existingConversation.availableTo = [senderId, receiverId];
    existingConversation.membersSeen = [senderId];
    existingConversation.updatedAt = new Date();
    existingConversation.latestMessage = {
      senderId,
      messageBody
    };

    await existingConversation.save();
    await createdMessage.populate([{ path: "conversation", select: "members latestMessage membersSeen updatedAt", populate: [{ path: "members.data" }] }, { path: "sender" }]);
    return createdMessage;
  }
};

const createByConversationId = async (user: IUser, conversationId: string, createMessageByConversationIdBody: CreateMessageByConversationIdBody) => {
  const senderId = createMessageByConversationIdBody.senderId;
  const senderType = createMessageByConversationIdBody.senderType;
  const messageBody = createMessageByConversationIdBody.messageBody;

  if (!isValidObjectId(conversationId)) throw new createHttpError.NotFound();
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new createHttpError.NotFound();
  if (!conversation.availableTo.includes(senderId)) throw new createHttpError.Forbidden();
  if (senderType === "Kennel") {
    if (senderId !== user.kennel?.toString()) throw new createHttpError.Forbidden();
  }

  const message = new Message({
    conversation: conversation.id,
    messageBody: messageBody,
    sender: senderId,
    senderType: senderType,
    availableTo: conversation.availableTo
  });

  const createdMessage = await message.save();

  conversation.membersSeen = [senderId];
  conversation.updatedAt = new Date();
  conversation.latestMessage = {
    senderId,
    messageBody
  };

  await conversation.save();
  await createdMessage.populate([{ path: "conversation", select: "members latestMessage updatedAt", populate: [{ path: "members.data" }] }, { path: "sender" }]);

  return createdMessage;
};

// const create = async (createMessageBody: CreateMessageBody, conversationId: string, user: IUser) => {
//   if (!isValidObjectId(conversationId)) throw new createHttpError.NotFound();

//   const conversation = await Conversation.findById(conversationId);
//   if (!conversation) throw new createHttpError.NotFound();

//   if (!conversation?.members.includes(user.id)) throw new createHttpError.Forbidden();

//   const message = new Message({
//     conversation: conversationId,
//     messageBody: createMessageBody.messageBody,
//     sender: createMessageBody.senderId
//   });

//   let createdMessage = await message.save();
//   createdMessage = await createdMessage.populate("sender");

//   conversation.membersSeen = [user.id];
//   conversation.updatedAt = new Date();
//   conversation.latestMessage = createdMessage.id;

//   await conversation.save();

//   await createdMessage.populate({ path: "conversation", populate: [{ path: "latestMessage" }, { path: "members" }] });

//   return createdMessage;
// };
// const create = async (user: IUser, createMessageBody: CreateMessageBody) => {
//   const ownerConversationId = createMessageBody.ownerConversationId;
//   const receiverConversationId = createMessageBody.receiverConversationId;
//   const senderId = createMessageBody.senderId;
//   const receiverId = createMessageBody.receiverId;
//   const messageBody = createMessageBody.messageBody;

//   let createdOwnerMessage;
//   let createdReceiverMessage;

//   if (ownerConversationId) {
//     if (!isValidObjectId(ownerConversationId)) throw new createHttpError.NotFound();

//     const ownerConversation = await Conversation.findById(ownerConversationId);
//     if (!ownerConversation) throw new createHttpError.NotFound();

//     const message = new Message({
//       conversation: ownerConversationId,
//       messageBody: messageBody,
//       sender: senderId
//     });
//     createdOwnerMessage = await message.save();

//     ownerConversation.membersSeen = [senderId];
//     ownerConversation.updatedAt = new Date();
//     ownerConversation.latestMessage = createdOwnerMessage.id;

//     await ownerConversation.save();
//   } else {
//     const newOwnerConversation = new Conversation();
//     newOwnerConversation.owner = senderId;
//     newOwnerConversation.onModelOwner = "User";
//     newOwnerConversation.receiver = receiverId;
//     newOwnerConversation.onModelReceiver = "Kennel";
//     const createdOnwerConversation = await newOwnerConversation.save();

//     const message = new Message({
//       conversation: createdOnwerConversation,
//       messageBody: messageBody,
//       sender: senderId
//     });
//     createdOwnerMessage = await message.save();

//     createdOnwerConversation.membersSeen = [senderId];
//     createdOnwerConversation.updatedAt = new Date();
//     createdOnwerConversation.latestMessage = createdOwnerMessage.id;

//     await createdOnwerConversation.save();
//   }

//   if (receiverConversationId) {
//     if (!isValidObjectId(receiverConversationId)) throw new createHttpError.NotFound();

//     const receiverConversation = await Conversation.findById(receiverConversationId);
//     if (!receiverConversation) throw new createHttpError.NotFound();

//     const message = new Message({
//       conversation: receiverConversationId,
//       messageBody: messageBody,
//       sender: senderId
//     });
//     createdReceiverMessage = await message.save();

//     receiverConversation.membersSeen = [senderId];
//     receiverConversation.updatedAt = new Date();
//     receiverConversation.latestMessage = createdOwnerMessage.id;

//     await receiverConversation.save();
//   } else {
//     const newReceiverConversation = new Conversation();
//     newReceiverConversation.owner = receiverId;
//     newReceiverConversation.onModelOwner = "Kennel";
//     newReceiverConversation.receiver = senderId;
//     newReceiverConversation.onModelReceiver = "User";
//     const createdReceiverConversation = await newReceiverConversation.save();

//     const message = new Message({
//       conversation: createdReceiverConversation,
//       messageBody: messageBody,
//       sender: senderId
//     });
//     createdReceiverMessage = await message.save();

//     createdReceiverConversation.membersSeen = [senderId];
//     createdReceiverConversation.updatedAt = new Date();
//     createdReceiverConversation.latestMessage = createdOwnerMessage.id;

//     await createdReceiverConversation.save();
//   }

//   // await createdOwnerMessage.populate({ path: "conversation", populate: [{ path: "latestMessage" }] });

//   return createdOwnerMessage;
// };

// const getByConversationId = async (conversationId: string, user: IUser, next: string) => {
const getByConversationId = async (conversationId: string, user: IUser, next: string) => {
  if (!isValidObjectId(conversationId)) throw new createHttpError.NotFound();

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new createHttpError.NotFound();

  if (!(conversation.availableTo.includes(user.id) || conversation.availableTo.includes(user.kennel!))) throw new createHttpError.Forbidden();

  const limit = 10;
  let _next;
  let query = { conversation: conversationId, availableTo: { $in: [user.id] } } as any;

  if (next) {
    query = { _id: { $lte: new mongoose.Types.ObjectId(next) }, conversation: conversationId, availableTo: { $in: [user.id] } };
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .populate([{ path: "sender" }, { path: "conversation", select: "membersSeen latestMessage" }]);
  // .populate("conversation", "membersSeen");

  if (messages.length > limit) {
    _next = messages[messages.length - 1].id;
    messages.pop();
  }

  return { messages, next: _next };
};

const getByMembersId = async (user: IUser, memberSelfId: string, memberId: string, next: string) => {
  if (!isValidObjectId(memberSelfId)) throw new createHttpError.NotFound();
  if (!isValidObjectId(memberId)) throw new createHttpError.NotFound();

  const conversation = await Conversation.findOne({
    members: { $all: [{ $elemMatch: { data: new mongoose.Types.ObjectId(memberSelfId) } }, { $elemMatch: { data: new mongoose.Types.ObjectId(memberId) } }] }
  });
  if (!conversation) return { messages: [] };

  if (!(conversation.availableTo.includes(user.id) || conversation.availableTo.includes(user.kennel!))) throw new createHttpError.Forbidden();

  const limit = 10;
  let _next;
  // let query = { conversation: new mongoose.Types.ObjectId(conversation.id), availableTo: { $in: [user.id] } } as any;
  let query: any = { conversation: new mongoose.Types.ObjectId(conversation.id), availableTo: { $in: [memberSelfId] } };

  if (next) {
    // query = { _id: { $lte: new mongoose.Types.ObjectId(next) }, conversation: conversationId, availableTo: { $in: [user.id] } };
    query = { _id: { $lte: new mongoose.Types.ObjectId(next) }, conversation: new mongoose.Types.ObjectId(conversation.id), availableTo: { $in: [memberSelfId] } };
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .populate([{ path: "sender" }, { path: "conversation", select: "membersSeen latestMessage" }]);

  if (messages.length > limit) {
    _next = messages[messages.length - 1].id;
    messages.pop();
  }

  return { messages, next: _next };
};

// const getByConversationId = async (conversationId: string, user: IUser, next: string) => {
//   if (!isValidObjectId(conversationId)) throw new createHttpError.NotFound();

//   const conversation = await Conversation.findById(conversationId);
//   if (!conversation) throw new createHttpError.NotFound();

//   if (conversation.availableTo.includes(user.id)) throw new createHttpError.Forbidden();

//   const limit = 10;
//   let _next;
//   let query = { conversation: conversationId } as any;

//   if (next) {
//     query = { _id: { $lte: new mongoose.Types.ObjectId(next) }, conversation: conversationId };
//   }

//   const messages = await Message.find(query)
//     .sort({ createdAt: -1 })
//     .limit(limit + 1)
//     .populate("sender")
//     .populate("conversation", "membersSeen");

//   if (messages.length > limit) {
//     _next = messages[messages.length - 1].id;
//     messages.pop();
//   }

//   return { messages, next: _next };
// };

const ConversationService = { create, createByConversationId, getByConversationId, getByMembersId };
export default ConversationService;

import * as Yup from "yup";
import asyncHandler from "../helpers/async-wrapper";

// const create = asyncHandler(async (req, _, next) => {
//   const schema = Yup.object().shape({
//     senderId: Yup.string()
//       .label("Sender id")
//       .required(),
//     messageBody: Yup.string()
//       .label("Message body")
//       .max(5000)
//       .required()
//   });

//   const validatedData = await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
//   req.body = validatedData;
//   next();
// });
const create = asyncHandler(async (req, _, next) => {
  const schema = Yup.object().shape({
    senderId: Yup.string()
      .label("Sender id")
      .required(),
    receiverId: Yup.string()
      .label("Receiver id")
      .required(),
    messageBody: Yup.string()
      .label("Message body")
      .max(5000)
      .required()
  });

  const validatedData = await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  req.body = validatedData;
  next();
});
const createByConversationId = asyncHandler(async (req, _, next) => {
  const schema = Yup.object().shape({
    senderId: Yup.string()
      .label("Sender id")
      .required(),
    senderType: Yup.string()
      .label("Sender type")
      .oneOf(["User", "Kennel"])
      .required(),
    messageBody: Yup.string()
      .label("Message body")
      .max(5000)
      .required()
  });

  const validatedData = await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  req.body = validatedData;
  next();
});

const MessageValidation = { create, createByConversationId };
export default MessageValidation;

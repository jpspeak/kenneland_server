import * as Yup from "yup";
import asyncHandler from "../helpers/async-wrapper";

const create = asyncHandler(async (req, _, next) => {
  const schema = Yup.object().shape({
    receiverId: Yup.string()
      .label("Receiver id")
      .required()
  });

  const validatedData = await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  req.body = validatedData;
  next();
});

const getByAvailableTo = asyncHandler(async (req, _, next) => {
  const schema = Yup.object().shape({
    senderId: Yup.string()
      .label("Sender id")
      .required(),
    receiverId: Yup.string()
      .label("Receiver id")
      .required()
  });

  const validatedData = await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  req.body = validatedData;
  next();
});

const ConversationValidation = { create, getByAvailableTo };
export default ConversationValidation;

import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IConversation extends Document {
  availableTo: (Types.ObjectId | string)[];
  members: { data: Types.ObjectId | string; type: "User" | "Kennel" }[];
  membersSeen: (Types.ObjectId | string)[];
  latestMessage: {
    senderId: Types.ObjectId | string;
    messageBody: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    availableTo: [{ type: Schema.Types.ObjectId }],
    members: [
      {
        data: { type: Schema.Types.ObjectId, required: true, refPath: "members.type" },
        type: {
          type: String,
          required: true,
          enum: ["User", "Kennel"]
        }
      }
    ],
    membersSeen: [{ type: Schema.Types.ObjectId }],
    latestMessage: {
      senderId: Schema.Types.ObjectId,
      messageBody: String
    }
  },
  { timestamps: true }
);

const Conversation: Model<IConversation> = mongoose.model("Conversation", conversationSchema);
export default Conversation;

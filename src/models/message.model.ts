import mongoose, { Document, Model, Types, PaginateModel, Schema } from "mongoose";
// import mongoosePaginate from "mongoose-paginate-v2";
import MongoPaging from "mongo-cursor-pagination";

export interface IMessage extends Document {
  conversation: Types.ObjectId | string;
  sender: Types.ObjectId | string;
  senderType: "User" | "Kennel";
  messageBody: string;
  availableTo: (Types.ObjectId | string)[];
}

const messageSchema = new Schema<IMessage>(
  {
    conversation: { type: Schema.Types.ObjectId, ref: "Conversation" },
    sender: { type: Schema.Types.ObjectId, refPath: "senderType" },
    senderType: {
      type: String,
      required: true,
      enum: ["User", "Kennel"]
    },
    messageBody: String,
    availableTo: [{ type: Schema.Types.ObjectId }]
  },
  { timestamps: true }
);

const Message: Model<IMessage> = mongoose.model<IMessage>("Message", messageSchema);
export default Message;

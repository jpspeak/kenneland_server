import mongoose, { Document, Model, Types, Schema } from "mongoose";

export interface IComment extends Document {
  body: string;
  post: Types.ObjectId;
}

const commentSchema = new Schema<IComment>(
  {
    body: String,
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post"
    }
  },
  {
    timestamps: true
  }
);

const Comment: Model<IComment> = mongoose.model("Comment", commentSchema);
export default Comment;

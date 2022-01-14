import mongoose, { Document, Model, Types, Schema } from "mongoose";

export interface IPostLike extends Document {
  user: Types.ObjectId;
  post: Types.ObjectId;
}

const postLikeSchema = new Schema<IPostLike>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    post: { type: Schema.Types.ObjectId, ref: "Post" }
  },
  {
    timestamps: true
  }
);

const PostLike: Model<IPostLike> = mongoose.model("PostLike", postLikeSchema);
export default PostLike;

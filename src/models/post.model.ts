import mongoose, { Document, Model, Types, Schema } from "mongoose";

export interface IPost extends Document {
  body: string;
  images: string[];
  user: Types.ObjectId;
}

const postSchema = new Schema<IPost>(
  {
    body: String,
    images: Array,
    user: { type: Schema.Types.ObjectId, ref: "Kennel" }
  },
  {
    timestamps: true
  }
);

const Post: Model<IPost> = mongoose.model("Post", postSchema);
export default Post;

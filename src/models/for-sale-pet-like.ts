import mongoose, { Document, Model, Types, Schema } from "mongoose";

export interface IForSalePetLike extends Document {
  user: Types.ObjectId;
  forSalePet: Types.ObjectId;
}

const forSalePetLikeSchema = new Schema<IForSalePetLike>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    forSalePet: { type: Schema.Types.ObjectId, ref: "ForSalePet" }
  },
  {
    timestamps: true
  }
);

const ForSalePetLike: Model<IForSalePetLike> = mongoose.model("ForSalePetLike", forSalePetLikeSchema);
export default ForSalePetLike;

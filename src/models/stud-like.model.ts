import mongoose, { Document, Model, Types, Schema } from "mongoose";

export interface IStudLike extends Document {
  user: Types.ObjectId;
  stud: Types.ObjectId;
}

const studLikeSchema = new Schema<IStudLike>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    stud: { type: Schema.Types.ObjectId, ref: "Stud" }
  },
  {
    timestamps: true
  }
);

const StudLike: Model<IStudLike> = mongoose.model("StudLike", studLikeSchema);
export default StudLike;

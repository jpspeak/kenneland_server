import mongoose, { Document, Model, Types, Schema } from "mongoose";

export interface IRefreshToken extends Document {
  user: Types.ObjectId;
  token: string;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" }
  },
  {
    timestamps: true
  }
);

const RefreshToken: Model<IRefreshToken> = mongoose.model("RefreshToken", refreshTokenSchema);
export default RefreshToken;

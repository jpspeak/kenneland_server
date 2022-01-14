import mongoose, { Document, Model, Types, Schema } from "mongoose";

export interface IUserData extends Document {
  user: Types.ObjectId | string;
  favoriteStuds: (Types.ObjectId | string)[];
  favoriteForSale: (Types.ObjectId | string)[];
}

const userDataSchema = new Schema<IUserData>({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  favoriteStuds: [{ type: Schema.Types.ObjectId, ref: "Stud" }],
  favoriteForSale: [{ type: Schema.Types.ObjectId, ref: "ForSale" }]
});

const UserData: Model<IUserData> = mongoose.model("UserData", userDataSchema);
export default UserData;

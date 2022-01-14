import mongoose, { Document, Model, Schema, Types } from "mongoose";
import ForSale from "./for-sale-pet.model";
import Kennel from "./kennel.model";
import RefreshToken from "./refresh-token.model";
import Stud from "./stud.model";

export enum AuthProvider {
  LOCAL = "LOCAL",
  GOOGLE = "GOOGLE",
  FACEBOOK = "FACEBOOK"
}
export enum Role {
  ADMIN = "ADMIN",
  USER = "USER"
}
export interface IUser extends Document {
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  provider: AuthProvider;
  password?: string;
  displayPicture?: string;
  kennel?: Types.ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, enum: ["USER", "ADMIN"], default: Role.USER },
    provider: { type: String, required: true, enum: ["LOCAL", "GOOGLE", "FACEBOOK"], select: false },
    password: { type: String, trim: true, select: false }, //optional
    displayPicture: String, //optional
    kennel: Schema.Types.ObjectId //optional
  },
  {
    timestamps: true
  }
);

// userSchema.post("save", async doc => {
//   await Kennel.create({
//     name: doc.firstName,
//     user: doc._id
//   });
// });

userSchema.post("remove", async doc => {
  await Kennel.deleteOne({ user: doc._id });
  await RefreshToken.deleteMany({ user: doc._id });
  await Stud.deleteMany({ user: doc._id });
  await ForSale.deleteMany({ user: doc._id });
});

const User: Model<IUser> = mongoose.model("User", userSchema);
export default User;

import mongoose, { Document, Model, Types, Schema } from "mongoose";

export interface IForSalePet extends Document {
  breed: string;
  sex: string;
  dateOfBirth: string;
  price: number;
  description: string;
  images: string[];
  sold: boolean;
  location: string;
  likesCount: number;
  kennel: Types.ObjectId | string;
  user: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const forSalePetSchema = new Schema<IForSalePet>(
  {
    breed: { type: String, required: true },
    sex: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    location: { type: String, required: true },
    likesCount: { type: Number, default: 0 },
    images: { type: [String], required: true },
    sold: { type: Boolean, default: false },
    kennel: {
      type: Schema.Types.ObjectId,
      ref: "Kennel"
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

const ForSalePet: Model<IForSalePet> = mongoose.model("ForSalePet", forSalePetSchema);
export default ForSalePet;

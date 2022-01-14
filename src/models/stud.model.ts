import mongoose, { Document, Model, Types, Schema } from "mongoose";
import MongoPaging from "mongo-cursor-pagination";

export interface IStud extends Document {
  name: string;
  // type: "Cat" | "Dog";
  breed: string;
  studFee?: number;
  description?: string;
  images: string[];
  location: string;
  likesCount: number;
  kennel: Types.ObjectId | string;
  user: Types.ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
}

const studSchema = new Schema<IStud>(
  {
    name: { type: String, required: true },
    // type: { type: String, enum: ["Cat", "Dog"], required: true },
    breed: { type: String, required: true },
    studFee: Number,
    description: String,
    images: { type: [String], required: true },
    location: { type: String, required: true },
    likesCount: { type: Number, default: 0 },
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
studSchema.plugin(MongoPaging.mongoosePlugin);

const Stud = mongoose.model<IStud>("Stud", studSchema);
export default Stud;

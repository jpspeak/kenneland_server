import mongoose, { Document, Model, Types, Schema, PaginateModel } from "mongoose";
import MongoPaging from "mongo-cursor-pagination";

export interface IKennel extends Document {
  name: string;
  displayPicture?: string;
  banner?: string;
  description?: string;
  breeds?: string[];
  location?: string;
  followersCount: number;
  email?: string;
  mobileNumber?: string;
  // address?: string;
  // location?: {
  //   type: string;
  //   coordinates: {
  //     lng: number;
  //     lat: number;
  //   };
  // };
  user: Types.ObjectId | string;
}

const kennelSchema = new Schema<IKennel>(
  {
    name: { type: String, required: true, trim: true },
    displayPicture: String,
    banner: String,
    description: String,
    breeds: [String],
    location: { type: String, required: true, trim: true },
    followersCount: { type: Number, default: 0 },
    email: String,
    mobileNumber: String,
    // address: { type: String, trim: true },
    // location: {
    //   type: {
    //     type: String,
    //     enum: ["Point"]
    //   },
    //   coordinates: {
    //     lng: Number,
    //     lat: Number
    //   }
    // },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);
// kennelSchema.index({ location: "2dsphere" });
kennelSchema.index({ breeds: "text" });
kennelSchema.plugin(MongoPaging.mongoosePlugin);

const Kennel = mongoose.model<IKennel>("Kennel", kennelSchema);

export default Kennel;

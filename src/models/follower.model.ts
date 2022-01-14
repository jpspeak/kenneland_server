import mongoose, { Document, Model, Types, Schema } from "mongoose";

export interface IKennelFollower extends Document {
  kennel: Types.ObjectId;
  user: Types.ObjectId;
}

const kennelFollowerSchema = new Schema<IKennelFollower>(
  {
    kennel: { type: Schema.Types.ObjectId, ref: "Kennel" },
    user: { type: Schema.Types.ObjectId, ref: "User" }
  },
  {
    timestamps: true
  }
);

const KennelFollower: Model<IKennelFollower> = mongoose.model("KennelFollower", kennelFollowerSchema);
export default KennelFollower;

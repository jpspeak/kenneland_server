import mongoose, { Document, Model, Schema } from "mongoose";

export interface IDogBreed extends Document {
  name: string;
}

const dogBreedSchema = new Schema<IDogBreed>({
  name: String
});

const DogBreed: Model<IDogBreed> = mongoose.model("DogBreed", dogBreedSchema);
export default DogBreed;

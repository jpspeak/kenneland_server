import asyncHandler from "../helpers/async-wrapper";
import DogBreed from "../models/dog-breed.model";

const getAll = asyncHandler(async (req, res) => {
  const dogBreeds = await DogBreed.find();
  res.json(dogBreeds);
});

const DogBreedController = { getAll };
export default DogBreedController;

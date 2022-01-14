import mongoose from "mongoose";
import config from "../config";
import seedUserKennel from "./user-kennel.seeder";
import seedStud from "./stud.seeder";
import seedForSale from "./for-sale-pet.seeder";
import seedDogBreed from "./dog-breed.seeder";

const seedDb = async () => {
  try {
    await mongoose.connect(config.database.mongodb.uri);

    console.log("Seeding database...");
    await seedUserKennel();
    await seedDogBreed();
    await seedStud();
    await seedForSale();

    console.log("Seeding successful.");
    await mongoose.disconnect();
  } catch (error) {
    console.log("Seeding failed.");
    console.log(error);
  }
  return;
};
seedDb();

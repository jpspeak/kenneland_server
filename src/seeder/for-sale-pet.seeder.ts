import ForSale, { IForSalePet } from "../models/for-sale-pet.model";
import faker from "faker";
import User from "../models/user.model";
import Kennel from "../models/kennel.model";

const seedForSalePet = async () => {
  const kennels = await Kennel.find().select(["id", "user"]);

  const forSalePets: IForSalePet[] = [];

  for (let i = 0; i < 20; i++) {
    const randomKennel = kennels[Math.floor(Math.random() * kennels.length)];

    const forSalePet = {} as IForSalePet;

    forSalePet.breed = faker.helpers.randomize(["American Bully", "American Bulldog", "Exotic American Bully"]);
    forSalePet.images = [faker.image.animals(), faker.image.animals()];
    forSalePet.user = randomKennel.user;
    forSalePet.kennel = randomKennel._id;
    forSalePet.price = 50000;
    forSalePet.createdAt = new Date();
    forSalePet.updatedAt = new Date();

    forSalePets.push(forSalePet);
  }

  await ForSale.insertMany(forSalePets);
  console.log("ForSalePet seeded.");
};

export default seedForSalePet;

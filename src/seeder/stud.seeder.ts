import Stud, { IStud } from "../models/stud.model";
import faker from "faker";
import Kennel from "../models/kennel.model";

const seedStud = async () => {
  const kennels = await Kennel.find().select(["id", "user"]);

  const studs: IStud[] = [];

  for (let i = 0; i < 20; i++) {
    const randomKennel = kennels[Math.floor(Math.random() * kennels.length)];

    const stud = {} as IStud;

    stud.name = faker.name.firstName();
    stud.breed = faker.helpers.randomize(["American Bully", "American Bulldog", "Exotic American Bully"]);
    stud.images = [faker.image.animals(), faker.image.animals()];
    stud.user = randomKennel.user;
    stud.kennel = randomKennel._id;
    stud.createdAt = new Date();
    stud.updatedAt = new Date();

    studs.push(stud);
  }

  await Stud.insertMany(studs);
  console.log("Stud seeded.");
};

export default seedStud;

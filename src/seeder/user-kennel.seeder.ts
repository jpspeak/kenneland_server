import User, { AuthProvider, IUser, Role } from "../models/user.model";
import faker from "faker";
import bcrypt from "bcrypt";
import Kennel from "../models/kennel.model";

const seedUserKennel = async () => {
  const users: IUser[] = [];

  for (let i = 0; i < 2; i++) {
    let user = {} as IUser;
    user.email = faker.internet.email();
    user.firstName = faker.name.firstName();
    user.lastName = faker.name.lastName();
    user.password = await bcrypt.hash("password", 10);
    user.role = Role.USER;
    user.provider = AuthProvider.LOCAL;
    user.createdAt = new Date();
    user.updatedAt = new Date();
    users.push(user);
  }
  await User.insertMany(users);
  console.log("User seeded.");

  const userIds = await User.find().select("id");

  const kennels = userIds.map(userId => {
    return {
      name: faker.name.title(),
      user: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });

  await Kennel.insertMany(kennels);
  console.log("Kennel seeded.");
};

export default seedUserKennel;

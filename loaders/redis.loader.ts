import { createClient } from "redis";

export let redisClient: ReturnType<typeof createClient>;

const redisLoader = async () => {
  const redisClient = createClient();

  redisClient.on("error", err => console.log("Redis Client Error", err));
  redisClient.on("connect", () => console.log("Redis Connection Established"));

  await redisClient.connect();
};

export default redisLoader;

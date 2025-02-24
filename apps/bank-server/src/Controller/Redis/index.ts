import { createClient } from "redis";


export async function getRedisClient(){
  try {
    const client = await createClient()
    .on('error', err => console.log('Redis Client Error', err))
    .connect();
    return client;
  } catch (error) {
    console.log((error as Error).message);
  }
}

export async function insertIntoRedis(token:string) {
  try {
      const client = await getRedisClient();
      console.log("retry redis main chala ", token, typeof token);
    await client?.hSet(token, "maxRetry", 5);
  } catch (error) {
    console.log((error as Error).message);
  }
}
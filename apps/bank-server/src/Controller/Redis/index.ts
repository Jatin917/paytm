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

export async function insertIntoRedis(userId:string, amount:string, recieverId:string, token:string) {
  try {
    const client = await getRedisClient();
    await client?.hSet(token, "amount", amount);
    await client?.hSet(token, "userId", userId);
    await client?.hSet(token, "recieverId", recieverId);
    await client?.hSet(token, "maxRetry", 5);
  } catch (error) {
    console.log((error as Error).message);
  }
}
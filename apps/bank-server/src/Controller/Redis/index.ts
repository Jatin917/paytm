import {createClient} from "redis";

export async function getRedisClient(retries = 3, delay = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = createClient();
      client.on('error', (err) => {
        console.error('Redis Client Error', err);
        throw err; // Immediately exit the current operation
    });
      await client.connect();
      return client; // Successfully connected
    } catch (error) {
      console.log(`Attempt ${attempt}: ${(error as Error).message}`);
      
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, delay)); // Wait before retrying
      } else {
        console.log("Max retries reached. Unable to connect to Redis.");
        return null; // Return null if all attempts fail
      }
    }
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

function connect() {
  throw new Error("Function not implemented.");
}

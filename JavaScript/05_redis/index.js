import redis, { createClient } from "redis"

const client = redis.createClient({
    host : 'localhost',
    port :  6379 // default port redis uses
}) // interact with redis server

// const client = createClient() // defaults to 6379

// event listener for redis client
client.on('error',(error) =>{
    console.log('Redis Client error: ', error)
})

async function testRedisConnection() {
    try {
      await client.connect();
      console.log("Connected to redis");
  
      await client.set("name", "sam");
  
      const extractValue = await client.get("name");
  
      console.log(extractValue);
  
      const deleteCount = await client.del("name");
      console.log(deleteCount);
  
      const extractUpdatedValue = await client.get("name");
      console.log(extractUpdatedValue);
  
      await client.set("count", "100");
      const incrementCount = await client.incr("count");
      console.log(incrementCount);
  
      const decrementCount = await client.decr("count");
      console.log(decrementCount);
      await client.decr("count");
      await client.decr("count");
      await client.decr("count");
      await client.decr("count");
      await client.decr("count");
      console.log(await client.get("count"));
    } catch (error) {
      console.error(error);
    } finally {
      await client.quit();
    }
  }
  
  testRedisConnection();

// const CoinAPI = require("./services/CoinAPI");
const MongoBackend = require('./services/backend/MongoBackend')
const RedisBackend = require('./services/backend/RedisBackend')

async function runMongo() {
  // const coinAPI = new CoinAPI();
  // return coinAPI.fetch();
  const mongoBackend = new MongoBackend()
  return mongoBackend.max()
}

async function runRedis() {
  const redisBackend = new RedisBackend()
  return redisBackend.max()
}

runRedis()
  .then((result) => {
    console.log('>>> result:', result) // >>> result: [ '2021-11-08', '67544.8733' ] // the highest price (score)
  })
  .catch((err) => console.error(err))

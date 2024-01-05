// const CoinAPI = require("./services/CoinAPI");
const MongoBackend = require('./services/backend/MongoBackend')
const RedisBackend = require('./services/backend/RedisBackend')
const MySQLBackend = require('./services/backend/MySQLBackend')

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

// runRedis()
//   .then((result) => {
//     console.log('>>> result:', result) // >>> result: [ '2021-11-08', '67544.8733' ] // the highest price (score)
//   })
//   .catch((err) => console.error(err))

async function runMySQL() {
  const mySQLBackend = new MySQLBackend()
  return mySQLBackend.max()
}

runMySQL()
  .then((result) => {
    console.log('>>> TextRow:', result)
    /* >>> TextRow: {
      id: 1035,
      valuedate: 2021-11-08T05:00:00.000Z,
      coinvalue: '67633.65'
    } */
  })
  .catch((err) => console.error(err))

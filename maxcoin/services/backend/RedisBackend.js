/* eslint-disable no-useless-constructor */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-empty-function */
const Redis = require('ioredis')
const CoinAPI = require('../CoinAPI')

class RedisBackend {
  constructor() {
    this.coinAPI = new CoinAPI()
    this.client = null
  }

  connect() {
    this.client = new Redis(7379)
    return this.client
  }

  async disconnect() {
    return this.client.disconnect()
  }

  async insert() {
    const data = await this.coinAPI.fetch()
    const values = []

    // Object.entries(data.bpi).forEach((entry) => {
    Object.entries(data.bpi).forEach(([date,price]) => {
      values.push(price) // score (Redis term) - entry[1]
      values.push(date) // member (Redis term) - entry[0]
    })
    return this.client.zadd('maxcoin:values', values)
  }

  // get the highest price (score)
  async getMax() {
    // min: -1: the start element, points to the last element; thus the starting point is the last element.
    // max: -1: the stop element, which will just return this one element.
    return this.client.zrange('maxcoin:values', -1, -1, 'WITHSCORES')
  }

  async max() {
    // connect
    console.info('### Connection to Redis')
    console.time('--- redis-connect')
    const client = this.connect()
    if (client) {
      console.info('--- Successfully connected to Redis')
    } else {
      throw new Error('--- Connection to Redis failed!')
    }
    console.timeEnd('--- redis-connect')

    // insert
    console.info('--- Inserting into Redis')
    console.time('--- redis-insert')
    const insertResult = await this.insert()
    console.timeEnd('--- redis-insert')
    console.info(`--- Inserted ${insertResult} documents into Redis`)

    // query
    console.info('--- Querying Redis')
    console.time('--- redis-find')
    const result = await this.getMax()
    console.timeEnd('--- redis-find')

    // disconnect
    console.info('### Disconnection from Redis')
    console.time('--- redis-disconnect')
    await this.disconnect()
    console.timeEnd('--- redis-disconnect')

    return result
  }
}

module.exports = RedisBackend

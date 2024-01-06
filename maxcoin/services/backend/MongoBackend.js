/* eslint-disable no-useless-constructor */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-empty-function */

const { MongoClient } = require('mongodb')
const CoinAPI = require('../CoinAPI')

class MongoBackend {
  constructor() {
    this.coinAPI = new CoinAPI()
    this.mongoUrl = 'mongodb://localhost:37017/maxcooin'
    this.client = null
    this.collection = null
  }

  async connect() {
    const mongoClient = new MongoClient(this.mongoUrl, {
      useUnifiedTopology: true, // useNewUrlParser is a deprecated option: useNewUrlParser has no effect since Node.js Driver version 4.0.0 and will be removed in the next major version
      useNewUrlParser: true, // useUnifiedTopology is a deprecated option: useUnifiedTopology has no effect since Node.js Driver version 4.0.0 and will be removed in the next major version
    })

    this.client = await mongoClient.connect()

    this.collection = this.client.db('maxcoin').collection('values')

    return this.client
  }

  async disconnect() {
    if (this.client) return this.client.close()

    return false
  }

  async insert() {
    const documents = []
    const data = await this.coinAPI.fetch()
    // console.log('data:', data)

    // Object.entries(data.bpi).forEach(entry => {
    Object.entries(data.bpi).forEach(([date, value]) => {
      documents.push({
        date, // date: entry[0]
        value, // value: entry[1]
      })
    })

    return this.collection.insertMany(documents)
  }

  async getMax() {
    return this.collection.findOne({}, { sort: { value: -1 } })
  }

  async max() {
    // connect
    console.info('### Connection to MongoDB')
    console.time('--- mongodb-connect')
    const client = await this.connect()
    if (client.isConnected()) {
      console.info('--- Successfully connected to MongoDB')
    } else {
      throw new Error('--- Connection to MongoDB failed!')
    }
    console.timeEnd('--- mongodb-connect')

    // insert
    console.info('--- Inserting into MongoDB')
    console.time('--- mongodb-insert')
    const insertResult = await this.insert()
    console.timeEnd('--- mongodb-insert')
    console.info(`--- Inserted ${insertResult.result.n} documents into MongoDB`)

    // query
    console.info('--- Querying MongoDB')
    console.time('--- mongodb-find')
    const doc = await this.getMax()
    console.timeEnd('--- mongodb-find')

    // disconnect
    console.info('### Disconnection from MongoDB')
    console.time('--- mongodb-disconnect')
    await this.disconnect()
    console.timeEnd('--- mongodb-disconnect')

    return {
      date: doc.date,
      value: doc.value,
    }
  }
}

module.exports = MongoBackend

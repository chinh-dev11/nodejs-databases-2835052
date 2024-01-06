#!/usr/bin/env node

const http = require('http')
const mongoose = require('mongoose')
const Redis = require('ioredis')

const Sequelize = require('sequelize')

const config = require('../config')
const App = require('../app')

async function connectToMongoose() {
  return mongoose.connect(config.mongodb.url, {
    // useNewUrlParser: true, // [MONGODB DRIVER] Warning: useNewUrlParser is a deprecated option: useNewUrlParser has no effect since Node.js Driver version 4.0.0 and will be removed in the next major version
    // useUnifiedTopology: true, // [MONGODB DRIVER] Warning: useUnifiedTopology is a deprecated option: useUnifiedTopology has no effect since Node.js Driver version 4.0.0 and will be removed in the next major version
    // useCreateIndex: true, // MongoParseError: option usecreateindex is not supported,
    // useFindAndModify: false // MongoParseError: option usefindandmodify is not supported
  })
}

function connectToRedis() {
  const redis = new Redis(config.redis.port)

  redis.on('connect', () => {
    console.info('### Successfully connected to Redis')
  })

  redis.on('error', (err) => {
    console.error(err)
    process.exit(1)
  })

  return redis
}

const redis = connectToRedis()
config.redis.client = redis

function connectToMySQL() {
  const sequelize = new Sequelize(config.mysql.options)
  sequelize
    .authenticate()
    .then(() => {
      console.log('Successfully connected to MySQL')
    })
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })

  return sequelize
}

const mysql = connectToMySQL()
config.mysql.client = mysql

/* Logic to start the application */
const app = App(config)
const port = process.env.PORT || '3000'
app.set('port', port)

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }
  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port  ${port}`

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`)
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`)
      process.exit(1)
      break
    default:
      throw error
  }
}

const server = http.createServer(app)

function onListening() {
  const addr = server.address()
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`

  console.info(`--- ${config.applicationName} listening on ${bind}`)
}

server.on('error', onError)
server.on('listening', onListening)

connectToMongoose()
  .then(() => {
    console.info('### Successfully connected to MongoDB')
    server.listen(port)
  })
  .catch((err) => {
    console.error(err)
  })

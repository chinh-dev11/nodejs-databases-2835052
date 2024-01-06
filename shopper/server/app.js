const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const session = require('express-session') // default Express session module.

// connect-redis v.7+: (session) causes TypeError
/* const RedisStore = require('connect-redis')(session)
TypeError: require(...) is not a function... */
const RedisStore = require('connect-redis')(session)

const routeHandler = require('./routes')

const UserService = require('./services/UserService')
const BasketService = require('./services/BasketService')

module.exports = (config) => {
  const app = express()

  // view engine setup
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'pug')

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))

  app.set('trust proxy', 1) // trust first proxy

  // Use the session middleware with some config arguments.
  // In this Express default config, Express will use the application's memory to store information in there. This is fine during development but it has some major shortcomings.
  app.use(
    session({
      store: new RedisStore({ client: config.redis.client }), // the Redis client is created in /server/bin/start.js
      secret: 'very secret secret to encyrpt session',
      resave: false,
      saveUninitialized: false,
    })
  )

  app.use(express.static(path.join(__dirname, '../client')))
  app.get('/favicon.ico', (req, res) => {
    res.status(204)
  })
  app.get('/robots.txt', (req, res) => {
    res.status(204)
  })

  // Define 'global' template variables here
  app.use(async (req, res, next) => {
    // To show the application name on the page
    res.locals.applicationName = config.applicationName

    // Set up flash messaging
    if (!req.session.messages) {
      req.session.messages = []
    }
    res.locals.messages = req.session.messages

    if (req.session.userId) {
      try {
        res.locals.currentUser = await UserService.getOne(req.session.userId)
        
        const basket = new BasketService(
          config.redis.client,
          req.session.userId
        )
        
        let basketCount = 0
        
        const basketContents = await basket.getAll()
        
        if (basketContents) {
          Object.keys(basketContents).forEach((itemId) => {
            basketCount += parseInt(basketContents[itemId], 10) // 10: the radix, the base of the numeric system for parseInt
          })
        }
        
        res.locals.basketCount = basketCount
      } catch (err) {
        return next(err)
      }
    }

    return next()
  })

  app.use('/', routeHandler(config))

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error(`Not Found (${req.url})`)
    err.status = 404
    next(err)
  })

  // error handler
  app.use((err, req, res) => {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
  })

  return app
}

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const flash = require('express-flash')
const logger = require('morgan')
const cors = require('cors')
const connectDB = require('./config/database')
// const methodOverride = require('method-override')
const mainRoutes = require('./routes/main')
const schoolsRoutes = require('./routes/schools')
const scorecardsRoutes = require('./routes/scorecards')
const userRoutes = require('./routes/user')


require('dotenv').config({path: './config/.env'})

// Passport config
require('./config/passport')(passport)

connectDB()

app.set('view engine', 'ejs')
app.disable('view cache'); // Disable EJS cache
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(logger('dev'))
app.use(cors())


// Sessions
app.use(
    session({
      secret: 'process.env.SESSION_SECRET',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ client: mongoose.connection.getClient() }),
    })
  )
  
// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
  
app.use('/', mainRoutes)
app.use('/schools', schoolsRoutes)
app.use('/scorecards', scorecardsRoutes)
app.use('/user', userRoutes)

// Force Heroku to use HTTPS
if(process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https')
      res.redirect(`https://${req.header('host')}${req.url}`)
    else
      next()
  })
}

// Method override
// app.use(
//   methodOverride(function (req, res) {
//     if (req.body && typeof req.body === 'object' && '_method' in req.body) {
//       // look in urlencoded POST bodies and delete it
//       let method = req.body._method
//       delete req.body._method
//       return method
//     }
//   })
// )

 
app.listen(process.env.PORT, ()=>{
    console.log('Server is running, you better catch it!')
})    
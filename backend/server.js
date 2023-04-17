require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');

const passport = require('./Middleware/passport/setup');
const auth = require('./routes/auth');
const interview = require('./routes/interview');
const networking = require('./routes/networking');
const profilepage = require('./routes/profilepage');

const MONGO_URI = process.env.DATABASE_URL;

const cors = require('cors');
const flash = require('connect-flash');

const app = express();
const port = 5000;

const resetroute = require('./routes/resetpassword');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const routes = require('./Middleware/routes'); // import the routes object from routes.js
const postroutes = require('./routes/postroutes');
const jobsroutes = require('./routes/jobsRoutes');
const skillsroutes = require('./routes/skillsroutes');

mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI })
}));

app.use(passport.initialize());
app.use(passport.session());

const whitelist = ["http://localhost:3000", "https://heroic-gelato-4e66ef.netlify.app", "https://reboundr.netlify.app"]
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}

app.use(cors(corsOptions));
app.use(flash()); // <- call the connect-flash function to create the middleware

app.use('/api', auth);
app.use('/api', routes);
app.use('/api', interview);
app.use('/api', postroutes);
app.use('/api', jobsroutes);
app.use('/api', networking);
app.use('/api', resetroute);
app.use('/api', skillsroutes);
app.use('/api', profilepage);

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));

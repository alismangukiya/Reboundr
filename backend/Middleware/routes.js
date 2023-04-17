const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');

const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');

const User = require('../Models/User');

router.use(cookieParser());
router.use(flash());
router.use(passport.initialize());
router.use(passport.session());


router.get('/', (req, res) => {
  res.send('Hello World, from express');
});


module.exports = router;
 
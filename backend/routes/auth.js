require('dotenv').config();
const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const bcrypt = require('bcrypt');

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(400).json({ message: err });
    }
    if (!user) {
      return res.status(401).json({ message: info.message }); 
    }
    req.login(user, { session: false }, (err) => {
      if (err) {
        return next(err);
      }
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.status(200).json({ message: 'Login successful.', token, id: user._id, userType: user.userType, user });
    });
  })(req, res, next);
});

// register route
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, userType } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash password and create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, firstName, lastName, userType });
    await newUser.save();

    // Return success message
    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error('Error in POST /register:', error);
    res.status(500).json({ message: 'Error creating user.' });
  }
});

// logout route
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated, ensureAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', async (req, res) => {
  const { username, name, email, password, password2 } = req.body;
  let errors = [];
  console.log(username)
  if (!name || !email || !password || !password2 || !username) {
    errors.push({ msg: 'Please enter all fields' });
  }
  let users = await User.find({ username: username });
  console.log(users);
  if (users.length != 0) {
    errors.push({ msg: 'Username has been taken' });
  }
  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    user = await User.findOne({ email: email })
    if (user) {
      errors.push({ msg: 'Email already exists' });
      res.render('register', {
        errors,
        name,
        email,
        password,
        password2
      });
    } else {
      const newUser = new User({
        name,
        email,
        password,
        username
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => {
              req.flash(
                'success_msg',
                'You are now registered and can log in'
              );
              res.redirect('/users/login');
            })
            .catch(err => console.log(err));
        });
      });
    }
  }
});

// Login using other email
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

router.get('/google', passport.authenticate(
  'google',
  {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  }
));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    if (req.user.username) {
      res.redirect('/dashboard');
    } else {
      res.redirect('/users/addUsername');
    }
  });

router.get('/verify', (req, res) => {
  if (req.user) {
    console.log('req.user');
  }
  else {
    console.log('Not auth');
  }
});

router.get('/addUsername', ensureAuthenticated, (req, res) => {
  res.render('addUsername');
});

router.post('/addUsername', ensureAuthenticated, async (req, res) => {
  let errors = [];
  if (req.body.username == '') {
    errors.push({ msg: 'Username must not be empty' })
    res.render('addUsername', { errors })
  }
  else {
    let users = await User.find({ username: req.body.username });
    if (users.length != 0) {
      errors.push({ msg: 'Username has already been taken' });
      res.render('addUsername', { errors })
    }
    else {
      let currentUser = await User.findOneAndUpdate({ googleID: req.user.googleID }, { $set: { username: req.body.username } });
      res.redirect('/dashboard')
    }
  }
})

module.exports = router;

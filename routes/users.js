const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated, ensureAuthenticated } = require('../config/auth');

// Login Page Regular Users
router.get('/u/login', forwardAuthenticated, (req, res) => {
  req.session.userType = "regular";
  res.render('userLogin');
  console.log(req.session.userType);
});

// Register Page
router.get('/u/register', forwardAuthenticated, (req, res) => res.render('userRegister'));

// Register
router.post('/u/register', async (req, res) => {
  console.log(req.body)
  const { username, email, password, password2 } = req.body;
  let errors = [];
  if (!email || !password || !password2 || !username) {
    errors.push({ msg: 'Please enter all fields' });
  }
  let users = await User.find({ username: username });
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
    res.render('userRegister', {
      errors: errors,
      username: username,
      email: email,
      password: password,
      password2: password2
    });
  } else {
    user = await User.findOne({ email: email })
    if (user) {
      errors.push({ msg: 'Email already exists' });
      res.render('userRegister', {
        errors: errors,
        username: username,
        email: email,
        password: password,
        password2: password2
      });
    } else {
      const newUser = new User({
        email,
        password,
        username,
        userType: "regular"
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => {
              req.flash('success_msg', 'You have been successfully registered');
              res.redirect('/users/u/login');
            })
            .catch(err => console.log(err));
        });
      });
    }
  }
});

//login using other email
router.post('/u/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/u/login',
    failureFlash: true
  })(req, res, next);
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
      let currentUser = await User.update({ googleID: req.user.googleID }, { $set: { username: req.body.username } });
      res.redirect('/dashboard')
    }
  }
})

// Login Page Professional Users
router.get('/p/login', forwardAuthenticated, (req, res) => {
  req.session.userType = "professional";
  res.render('profLogin');
});

// Get Details Page Professional Users
router.get('/p/profDetails', ensureAuthenticated, (req, res) => {
  res.render('profDetails');
});

// Post Details Page Professional Users
router.post('/p/profDetails', ensureAuthenticated, async (req, res) => {
  const { dets } = req.body;
  let errors = [];
  if (!dets) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (errors.length > 0) {
    res.render('userRegister', {
      dets,
      errors
    });
  } else {
    let updatedUser = await User.findByIdAndUpdate({ _id: req.user._id }, { $set: { isMedicalDetailsEntered: true } });
    req.flash('success_msg', 'You have successfully entered your professional details. Kindly wait for 1-3 days for the verification process to complete.');
    res.redirect('/dashboard');
  }
});

// Logout
router.get('/logout', (req, res) => {
  if (req.user.userType == "regular") {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/u/login');
  } else {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/p/login');
  }
});

//google login
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
    if (!req.user.userType) {
      User.findOneAndUpdate({ email: req.user.email }, { $set: { userType: req.session.userType } })
        .then(async user => {
          let user1 = await User.findOne({ email: req.user.email });
          if (!user1.username && user1.userType == "regular") {
            res.redirect('/users/addUsername');
          } else if (user1.userType == "professional" && !user1.isMedicalDetailsEntered) {
            res.redirect('/p/profDetails');
          } else {
            res.redirect('/dashboard');
          }
        })
    } else {
      if (!req.user.username && req.user.userType == "regular") {
        res.redirect('/users/addUsername');
      } else if (req.user.userType == "professional" && !req.user.isMedicalDetailsEntered) {
        res.redirect('/users/p/profDetails');
      } else {
        res.redirect('/dashboard');
      }
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

module.exports = router;

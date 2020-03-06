const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Article = require('../models/Article');
const User = require('../models/User');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'))

// Dashboard
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  let articles = await Article.find({ userID: req.user._id })
  res.render('dashboard', {
    user: req.user,
    articles
  })
});

module.exports = router;

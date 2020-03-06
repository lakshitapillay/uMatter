const express = require('express');
const router = express.Router();
// Load User model
const User = require('../models/User');
const Article = require('../models/Article');
const { forwardAuthenticated, ensureAuthenticated } = require('../config/auth');

router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('addArticle');
});

router.post('/add', ensureAuthenticated, async (req, res) => {
    const { title, text, catering, topicType } = req.body;
    let errors = [];
    if (!title || !text || !topicType || !catering) {
        errors.push({ msg: 'All fields are required' });
    }
    if (errors.length > 0) {
        res.render('addArticle', {
            errors: errors,
            text,
            title,
            topicType,
            catering
        });
    }
    else {
        let article = await Article.create({ title: title, text: text, catering: catering, topicType: topicType, userID: req.user._id });
        console.log(article);
        res.redirect('/dashboard')
    }
});

router.get('/edit/:articleId', ensureAuthenticated, async (req, res) => {
    let article = await Article.findOne({ _id: req.params.articleId })
    res.render('editArticle', { article });
});

router.post('/edit/:articleId', ensureAuthenticated, async (req, res) => {
    const { title, text, catering, topicType } = req.body;
    let errors = [];
    if (!title || !text || !topicType || !catering) {
        errors.push({ msg: 'All fields are required' });
    }
    if (errors.length > 0) {
        let article = await Article.findOne({ _id: req.params.articleId })
        res.render('editArticle', { errors, article });
    }
    else {
        let article = await Article.update({ _id: req.params._id }, { $set: { title: title, text: text, catering: catering, topicType: topicType, userID: req.user._id } });
        console.log(article);
        res.redirect('/dashboard')
    }
});

router.delete('/delete/:articleId', ensureAuthenticated, (req, res) => {

})

module.exports = router;
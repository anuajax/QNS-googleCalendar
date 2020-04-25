const express = require('express');
const passport = require('../utils/passport-util');// const passport = require('passport');
const router = express.Router();
const googleUtil = require('../utils/google-util');

router.get('/', (req, res) => {
    res.render('index.ejs');
});

router.get('/login', passport.authenticate('google', {
    scope: [
        'profile',
        'email'
    ]
}));

router.get('/auth/success', passport.authenticate('google'), (req, res) => {
    res.redirect('/home');
});

router.get('/home', (req, res) => {
    if (typeof req.user === 'undefined') {
        res.redirect('/login')
    } else {
        res.render('redirect.ejs');
    }
})

module.exports = router;
const express = require('express');
const router = express.Router();
const defTimer = require('../models/default');

router.use(express.urlencoded({extended:true}));

router.use((req, res, next) => {
    if (!req.session) {
        req.session = defTimer;
    }
    next();
});

router.get('/', (req, res) => {
    const {timers} = req.session;
    res.render('options', timers);
});

router.put('/', (req, res) => {
    req.session.timers = req.body;
    res.redirect('/');
});

module.exports = router;
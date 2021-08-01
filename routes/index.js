const express = require('express');
const router = express.Router();
const defTimer = require("../models/default");
router.use('/options', require('./options'));

router.use((req, res, next) => {
    if (!req.session) {
        req.session = defTimer;
    }
    next();
});

router.get('/', (req, res) => {
    const {timers, sound, auto} = req.session;
    res.render('index', {timers, sound, auto});
});

module.exports = router;
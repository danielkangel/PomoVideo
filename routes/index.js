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
    const {timers} = req.session;
    res.render('index', timers);
});

module.exports = router;
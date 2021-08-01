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
    const {timers, sound, auto} = req.session;
    res.render('options', {timers, sound, auto});
});

router.put('/', (req, res) => {
    console.log(req.body);
    const {workTime, longBreak, shortBreak, sound, auto} = req.body;
    req.session.timers = {workTime, longBreak, shortBreak};
    req.session.sound = sound;
    req.session.auto = auto;
    res.redirect('/');
});

module.exports = router;
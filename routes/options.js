const express = require('express');
const router = express.Router();
const defTimer = require('../models/default');

router.use(express.urlencoded({extended:true}));

// checks if session exists yet
router.use((req, res, next) => {
    if (!req.session.settings) {
        req.session.settings = defTimer;
    }
    next();
});

// renders the options template with user's settings
router.get('/', (req, res) => {
    const {timers, sound, auto, volume} = req.session.settings;
    res.render('options', {timers, sound, auto, volume});
});

// updates user options
router.put('/', (req, res) => {
    const {workTime, longBreak, shortBreak, sound, auto, volume} = req.body;
    req.session.settings.timers = {workTime, longBreak, shortBreak};
    req.session.settings.sound = sound;
    req.session.settings.auto = auto;
    req.session.settings.volume = volume;
    res.redirect('/');
});

// responds with user settings object
router.get('/object', (req, res) => {
    res.send(req.session.settings);
});

module.exports = router;
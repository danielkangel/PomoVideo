const express = require('express');
const router = express.Router();

router.use(express.urlencoded({extended:true}));

// renders the options template with user's settings
router.get('/', (req, res) => {
    const {timers, sound, auto, volume, breakOnly} = req.session.settings;
    res.render('options', {timers, sound, auto, volume, breakOnly});
});

// updates user options
router.put('/', (req, res) => {
    const {workTime, longBreak, shortBreak, sound, auto, volume, breakOnly} = req.body;
    req.session.settings.timers = {workTime, longBreak, shortBreak};
    req.session.settings.sound = sound;
    req.session.settings.auto = auto;
    req.session.settings.volume = volume;
    req.session.settings.breakOnly = breakOnly;
    res.redirect('/');
});

// responds with user settings object
router.get('/object', (req, res) => {
    res.send(req.session.settings);
});

module.exports = router;
const express = require('express');
const router = express.Router();
const defTimer = require("../models/default");
const axios = require('axios');
const {v4: uuidv4} = require('uuid');

router.use('/options', require('./options'));
router.use(express.urlencoded({extended:true}));

// checks if session exists yet
router.use((req, res, next) => {
    if (!req.session.settings) {
        req.session.settings = defTimer;
    }
    next();
});

// loads the index template with the user settings
router.get('/', (req, res) => {
    const {timers, sound, auto, volume, videos} = req.session.settings;
    res.render('index', {timers, sound, auto, volume, videos});
});

// fetches info on a video and adds it to the session
router.post('/:id', (req, res) => {
    const {id} = req.params;
    const link = `https://www.youtube.com/watch?v=${id}`;

    // fetches video information from youtube
    axios.get(`https://www.youtube.com/oembed?url=${link}&format=json`)
    .then (body => {
        let {title} = body.data;
        const thumbnail_url = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
        if (title.length >= 20) title = title.substring(0,20) + "...";
        const vid = {
            id: id,
            title: title,
            img: thumbnail_url,
            uuid: uuidv4()
        }

        // adds the video to the session
        req.session.settings.videos.push(vid);
        res.send(vid);
    })
    .catch (err => {
        res.send(err);
    });
});

// deletes a video from the session
router.delete('/:uuid', (req, res) => {
    const {uuid} = req.params;
    const {videos} = req.session.settings;

    // find the video in the array
    let x = 0;
    while (x < videos.length){
        if (videos[x].uuid == uuid) break;
        x++;
    }

    // remove the video from the array
    videos.splice(x,1);
    req.session.settings.videos = videos;
    res.send(videos);
});

// redirect any 404 requests to the index
router.use((req, res) => {
    res.redirect('/');
});

module.exports = router;
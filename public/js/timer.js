// puts the current timer lengths into an object
let timers;

// loads the main timer element
const timerElem = document.querySelector('#timer');

// loads the currently selected audio
let audio;

// checks if auto start needs to be used
let auto;

// variable used to keep track of pomodoros finished
let pomoCount = 0;

// interval used for counting down every second
let everySecond;

// holds the video queue
let videos;

// hold the YT player embed
let player;

// checks if videos can only be played during breaks
let breakOnly;

// holds the current video position
let videoPos = 0;

// selects the pomodoro timer when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
    axios.get('http://localhost:3000/options/object')
    .then(res => {
        const {data} = res;
        timers = data.timers;
        auto = data.auto;
        audio = new Audio(`audio/${data.sound}.mp3`);
        audio.volume = data.volume / 100.0;
        videos = data.videos;
        breakOnly = data.breakOnly;
        changeMode('workTime');
    })
    .catch (err => {
        console.log(err);
    });
});

// changes the mode when the corresponding button is clicked
const selectMode = document.querySelector(".break-buttons");
selectMode.addEventListener('click', checkMode); 

// stops the timer when the stop button is clicked 
// starts the timer when the start button is clicked
const startButton = document.querySelector("#start-button");
startButton.addEventListener('click', () => {
    const {mode} = startButton.dataset;
    if (mode === 'start'){
        beginTimer();
    } else if (mode === 'stop'){
        swapButton();
    } 
});

// resets the timer when the reset button is clicked
const resetButton = document.querySelector("#reset");
resetButton.addEventListener('click', ()=> {
    const {mode} = timers;
    changeMode(mode, true);
});

// elements required to add videos 
const videoList = document.querySelector("#video-list");
const addVideo = document.querySelector("#add-video-submit");
const enterLink = document.querySelector("#link");

// adds a video when the modal is submitted 
addVideo.addEventListener('click', () => {
    // get the input value and reset it 
    const link = enterLink.value;
    enterLink.value = '';

    // basic link validation
    const vidId = parseId(link);
    if (vidId) {
        // send a post request to save the videos in the session config 
        axios.post(`http://localhost:3000/${vidId}`)
        .then(res => {
            // destructure the generated video object
            const {data} = res;
            console.log(videos);
            if (videos.length === 0) {
                const placeholder = document.querySelector('#placeholder');
                placeholder.parentNode.removeChild(placeholder);
            } 
            // generate all the required elements
            const article = genArticle();
            article.appendChild(genImg(data.img));
            article.appendChild(genP(data.title));
            article.appendChild(genBtn());
            article.id = data.uuid;
            videoList.appendChild(article);

            // add the video onto this script's list
            videos.push(data);

            // if the video list was previously empty, generate a new player
            if (videos.length === 1){ 
                player = genPlayer(vidId);
            }
        })
        .catch (err => {
            console.log(err);
        });
    }
});

// generates the article containing video info
function genArticle(){
    const article = document.createElement('article');
    article.classList.add('row', 'py-2', 'video-background', 'mx-1', 'rounded', 'mb-3');
    return article;
}

// generates the video thumbnail
function genImg(url){
    const img = document.createElement('img');
    img.src = url;
    img.alt = "Thumbnail";
    img.classList.add("col-3");
    return img;
}

// generates the video title
function genP(title){
    const p = document.createElement('p');
    p.classList.add('col-7', 'mb-0', 'p-0', 'align-self-center');
    p.textContent = title;
    return p;
}

// generates the delete button
function genBtn() {
    const btn = document.createElement('button');
    btn.classList.add("btn", "col-2", "del-button");
    btn.innerText = "x";
    btn.addEventListener('click', deleteVid);
    return btn;
}

// adds the delete function to all buttons on the page
const delBtns = document.querySelectorAll('.del-button');
delBtns.forEach(btn => btn.addEventListener('click', deleteVid));

// deletes a video from the queue
function deleteVid(btn){
    // selects the vid being deleted
    const vid = btn.target.parentNode;

    // sends a delete request for the video
    axios.delete(`/${vid.id}`)
    .then(res => {
        
        // remove the video
        vid.parentNode.removeChild(vid);

        // if the delete request was for the first video, clear the player
        if (vid.id === videos[0].uuid){
            player.destroy();
            // if theres a next video in the queue, generate a player of that video
            if (videos[1]) player = genPlayer(videos[1].id);
            else {
                videoList.appendChild(genPlaceholder());
                player = undefined;
            }
        }
        
        // update the local video array
        videos = res.data;
    })
    .catch(err => {
        console.log(err);
    });
}

// generates placeholder tag
function genPlaceholder(){
    const placeholder = document.createElement('p');
    placeholder.innerText = ". . .";
    placeholder.id = "placeholder";
    placeholder.classList.add('align-self-center', 'fw-bold');
    return placeholder;
}

// checks the mode of the button clicked
function checkMode(btn){
    const {mode} = btn.target.dataset;
    if (!mode) return;
    changeMode(mode, true);
}


// reduces the time by one second each call
function calcTimeLeft(){
    const curr = timers.remainingTime;
    curr.total--;

    // checks if minutes needs to be reduced;
    if (curr.seconds == 0){
        curr.seconds = 59;
        curr.minutes--;
    } else {
        curr.seconds--;
    }
}

// starts and runs the timer every second
function beginTimer(){
    let {remainingTime} = timers;

    swapButton();

    // updates the timer every second
    everySecond = setInterval( () => {
        calcTimeLeft();
        changeClock();

        // checks if the timer has finished
        if (remainingTime.total <= 0){
            // plays the current selected audio
            audio.play();

            // checks the current mode of the timer for auto update
            if (timers.mode === 'workTime'){
                pomoCount++;

                // checks if there have been 4 pomodoros yet 
                if (pomoCount < 4) {
                    changeMode('shortBreak');
                } else {
                    changeMode('longBreak');
                    pomoCount = 0;
                }

            } else {
                changeMode('workTime');
            }

            // if auto start is selected, continue the interval
            if (auto === 'true'){
                remainingTime = timers.remainingTime;
                if (breakOnly === 'true') {
                    if (timers.mode === 'workTime') {
                        player && player.pauseVideo();
                    } else {
                        player && player.playVideo();
                    }   
                }
            } else {
                clearInterval(everySecond);
            }
        }
    }, 1000);
}

// updates the timer's mode based on the passed argument
function changeMode(mode, clicked = false){
    // updates the timers mode and remaining time
    timers.mode = mode;
    timers.remainingTime = {
        total: timers[mode]*60,
        minutes: timers[mode],
        seconds: 0
    }

    // turns the stop button to a start button if auto is not enabled or the mode buttons are clicked
    if (startButton.dataset.mode === 'stop' && (auto !== 'true' || clicked)){
        swapButton();
    }

    // updates the selected timer buttons
    document.querySelectorAll('button[data-mode]').forEach(b => b.classList.remove('currTimer'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('currTimer');
    changeClock();
}

// swaps the start/stop button to another mode
function swapButton() {
    if (startButton.dataset.mode === 'stop') {
        // updates the stop button to start
        startButton.dataset.mode = 'start';
        startButton.textContent = "Start Timer";
        startButton.classList.remove('btn-danger');
        startButton.classList.add('btn-success');
        clearInterval(everySecond);
        player && player.pauseVideo();
    } else if (startButton.dataset.mode === 'start') {
        // updates the start button to stop
        startButton.dataset.mode = 'stop';
        startButton.textContent = 'Stop Timer';
        startButton.classList.add('btn-danger');
        startButton.classList.remove('btn-success');
        if (breakOnly && timers.mode !== 'workTime') player && player.playVideo();
    }
}


// updates the displayed timer seen in the main card and header
function changeClock() {
    // destructuring remainingTime from timers
    const {remainingTime} = timers;

    // formats the displayed timer text
    const min = `${remainingTime.minutes}`.padStart(2,'0');
    const sec = `${remainingTime.seconds}`.padStart(2,'0');

    // selects the editable elements
    const timerMin = document.querySelector('#timer-minutes');
    const timerSec = document.querySelector('#timer-seconds');
    const header = document.querySelector('title');

    // reformats the header string
    const headerString = `${min}:${sec} - PomoVideo`;

    // updates the displayed timer
    timerMin.textContent = min;
    timerSec.textContent = sec;
    header.textContent = headerString;
}

// parses the submitted link, checking if it is the right format
function parseId(link) {
    let video_id = link.split('v=')[1];
    if (video_id) {
        const ampersandPosition = video_id.indexOf('&');
        if(ampersandPosition != -1) video_id = video_id.substring(0, ampersandPosition);
        return video_id.length == 11 ? video_id : undefined; 
    }
    return undefined;
}

// adds the YouTube iframe api
// FIXME: youtube responds with 10+ cookies generating SameSite warnings
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// load the first video when the player loads
function onYouTubeIframeAPIReady() {
    if (videos[0]){
        player = genPlayer(videos[0].id);
    }
}

// returns a new player with the passed id
function genPlayer(id) {
    return new YT.Player('player', {
        width: '100%',
        height: '100%',
        host: 'http://www.youtube-nocookie.com',
        videoId: id,
        playerVars: {
            origin: window.location.host,
            'playsinline': 1,
            'modestbranding': 1,
            'disablekb': 1,
            'iv_load_policy': 3,
            'fs' : 0,
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': checkPlayer, 
        }
    });
}

function onPlayerReady() {
    if (breakOnly && startButton.dataset.mode === 'stop' && timers.mode != 'workTime'){
        player.playVideo();
    }
}

function checkPlayer(state){
    if ((startButton.dataset.mode === 'start' || (breakOnly && timers.mode === 'workTime')) && state.data == YT.PlayerState.PLAYING){
        player.pauseVideo();
    } else if (state.data == YT.PlayerState.ENDED){
        console.log("we in here");
        const element = document.getElementById(videos[0].uuid).lastChild;
        element.dispatchEvent(new Event('click'));
    }
}
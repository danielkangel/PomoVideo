// loads the current timer lengths
const pomoTime = parseInt(document.querySelector("#pomo").dataset.len);
const shortTime = parseInt(document.querySelector("#sBreak").dataset.len);
const longTime = parseInt(document.querySelector("#lBreak").dataset.len);

// puts the current timer lengths into an object
const timers = {
    workTime: pomoTime,
    shortBreak: shortTime,
    longBreak: longTime
};

// loads the main timer element
const timerElem = document.querySelector('#timer');

// loads the currently selected audio
const audio = new Audio(`audio/${timerElem.dataset.sound}.mp3`);

// checks if auto start needs to be used
const auto = timerElem.dataset.auto;

// variable used to keep track of pomodoros finished
let pomoCount = 0;

// interval used for counting down every second
let everySecond;

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

// selects the pomodoro timer when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
    changeMode('workTime');
});

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
    if (startButton.dataset.mode == 'stop') {
        // updates the stop button to start
        startButton.dataset.mode = 'start';
        startButton.textContent = "Start Timer";
        startButton.classList.remove('btn-danger');
        startButton.classList.add('btn-success');
        clearInterval(everySecond);
    } else if (startButton.dataset.mode == 'start') {
        // updates the start button to stop
        startButton.dataset.mode = 'stop';
        startButton.textContent = 'Stop Timer';
        startButton.classList.add('btn-danger');
        startButton.classList.remove('btn-success');
    }
}


// updates the displayed timer seen in the main card and header
function changeClock() {
    // destructuring remainingTime from 
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

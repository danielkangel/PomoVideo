const pomoTime = parseInt(document.querySelector("#pomo").dataset.len);
const shortTime = parseInt(document.querySelector("#sBreak").dataset.len);
const longTime = parseInt(document.querySelector("#lBreak").dataset.len);

const timers = {
    workTime: pomoTime,
    shortBreak: shortTime,
    longBreak: longTime
};


let everySecond;

const selectMode = document.querySelector(".break-buttons");
selectMode.addEventListener('click', checkMode); 

const startButton = document.querySelector("#start-button");
startButton.addEventListener('click', () => {
    const {mode} = startButton.dataset;
    if (mode === 'start'){
        beginTimer();
    } else if (mode === 'stop'){
        swapButton();
    } 
});

const resetButton = document.querySelector("#reset");
resetButton.addEventListener('click', ()=> {
    const {mode} = timers;
    changeMode(mode);
});


document.addEventListener('DOMContentLoaded', () => {
    changeMode('workTime');
});

function checkMode(btn){
    const {mode} = btn.target.dataset;
    if (!mode) return;
    changeMode(mode);
}


function calcTimeLeft(){
    const curr = timers.remainingTime;
    curr.total--;
    if (curr.seconds == 0){
        curr.seconds = 59;
        curr.minutes--;
    } else {
        curr.seconds--;
    }
}

function beginTimer(){
    let {remainingTime} = timers;

    swapButton();

    everySecond = setInterval( () => {
        calcTimeLeft();
        changeClock();
        if (remainingTime.total <= 0){ 
            clearInterval(everySecond);
            swapButton();
        }
    }, 1000);
}

function changeMode(mode){
    timers.mode = mode;
    timers.remainingTime = {
        total: timers[mode]*60,
        minutes: timers[mode],
        seconds: 0
    }

    if (startButton.dataset.mode == 'stop') {
        swapButton();
    }

    document.querySelectorAll('button[data-mode]').forEach(b => b.classList.remove('currTimer'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('currTimer');
    changeClock();
}

function swapButton() {
    if (startButton.dataset.mode == 'stop') {
        startButton.dataset.mode = 'start';
        startButton.textContent = "Start Timer";
        startButton.classList.remove('btn-danger');
        startButton.classList.add('btn-success');
        clearInterval(everySecond);
    } else if (startButton.dataset.mode == 'start') {
        startButton.dataset.mode = 'stop';
        startButton.textContent = 'Stop Timer';
        startButton.classList.add('btn-danger');
        startButton.classList.remove('btn-success');
    }
}

function changeClock() {
    const {remainingTime} = timers;
    const min = `${remainingTime.minutes}`.padStart(2,'0');
    const sec = `${remainingTime.seconds}`.padStart(2,'0');

    const timerMin = document.querySelector('#timer-minutes');
    const timerSec = document.querySelector('#timer-seconds');

    const header = document.querySelector('title');
    const headerString = `${min}:${sec} - PomoVideo`;

    timerMin.textContent = min;
    timerSec.textContent = sec;
    header.textContent = headerString;
}

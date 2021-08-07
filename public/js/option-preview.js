const previewButton = document.querySelector("#preview-btn");
const soundList = document.querySelector("#sound");
const volumeSlider = document.querySelector("#volume");
const volumePerc = document.querySelector("#percent");

previewButton.addEventListener('click', previewAudio);
volumeSlider.addEventListener('input', updateVolume);

function previewAudio(){
    const currSound = soundList.options[soundList.selectedIndex].value;
    const audio = new Audio(`audio/${currSound}.mp3`);
    audio.volume = parseInt(volumeSlider.value) / 100.0;
    audio.play();
}

function updateVolume(){
    volumePerc.textContent = volumeSlider.value;
}
const serverUrl = window.location.origin;
const ctx = new (window.AudioContext || window.webkitAudioContext)();
const sampleRate = ctx.sampleRate;
let gainNode = null; // Variable to store the gain node
let activeSource = null; // Variable to store the currently active source
let activeFrequency = null;
let activeFilters = []
const activeKeys = []

let availableFilters = {}

import * as lowpass from "./filters/lowpass.mjs"
availableFilters["lowpass"] = lowpass

const analyser = new AnalyserNode(ctx, {
    smoothingTimeConstant: 1,
    fftSize: 2048
})
const dataArray = new Uint8Array(analyser.frequencyBinCount);
let c = null;
document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("canvas")

    c = canvas.getContext("2d")


    canvas.width = window.innerWidth;
    canvas.height = 200;
    const pixelRatio = window.devicePixelRatio;
    const sizeOnScreen = canvas.getBoundingClientRect();
    canvas.width = sizeOnScreen.width * pixelRatio;
    canvas.height = sizeOnScreen.height * pixelRatio;
    canvas.style.width = canvas.width / pixelRatio + "px";
    canvas.style.height = canvas.height / pixelRatio + "px";
    c.fillStyle = "#181818";
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.strokeStyle = "#33ee55";
    c.beginPath();
    c.moveTo(0, canvas.height / 2);
    c.lineTo(canvas.width, canvas.height / 10);
    c.stroke();
});


//maps keyboard keys to equivalent notes
const keyNoteMapping = {
    'tab': 'C4', '1': 'C#4', 'q': 'D4', '2': 'D#4',
    'w': 'E4', 'e': 'F4', '4': 'F#4', 'r': 'G4',
    '5': 'G#4', 't': 'A4', '6': 'A#4', 'y': 'B4',
    'u': 'C5', '8': 'C#5', 'i': 'D5', '9': 'D#5',
    'o': 'E5', 'p': 'F5', '-': 'F#5', '[': 'G5',
    '=': 'G#5', ']': 'A5', 'backspace': 'A#5', '#': 'B5',

    // Add more keys as needed
};
//Event listener for the keydown event
document.addEventListener('keydown', function (event) {
    //prevents default tab behaviour since it is used for keyboard input
    if (event.key === 'Tab') {
        event.preventDefault();
    }
    const keyPressed = event.key.toLowerCase();

    //tests if key is already playing
    if (!activeKeys.includes(keyPressed)) {
        activeKeys.push(keyPressed);


        // Check if the pressed key is in the mapping
        if (keyNoteMapping.hasOwnProperty(keyPressed)) {
            const note = keyNoteMapping[keyPressed];


            //calling notedown to start sequence
            noteDown(note, "1234567890-=backspace`".includes(keyPressed) && keyPressed != "p" && keyPressed != "e");
        }
    }
});
function getConfig() {
    // Assuming config.json is in the same directory as your HTML/JS file

    return new Promise((resolve, reject) => {
        fetch(`${serverUrl}/get_config`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Do something with the JSON data if needed
                resolve(data);
            })
            .catch(error => {
                console.error('Error loading config:', error);
                reject(error);
            });
    });
}
//Event listenter for when a key is released
document.addEventListener('keyup', function (event) {
    const keyReleased = event.key.toLowerCase();
    const index = activeKeys.indexOf(keyReleased);

    // Check if the key is in the activeKeys array
    if (index !== -1) {
        activeKeys.splice(index, 1);
    }
    //tests if key is viable
    if (keyNoteMapping.hasOwnProperty(keyReleased)) {
        const note = keyNoteMapping[keyReleased];
        noteUp(note, "1234567890-=backspace`".includes(keyReleased) && keyReleased != "p" && keyReleased != "e");
    }
    //restarts original note if simultaneous notes played
    // if (activeKeys) {
    //     noteDown(keyNoteMapping[activeKeys[0]],)
    // }
});

//applies formula to convert midi to the equivalent frequency value
function getFrequency(midiValue) {
    return Math.pow(2, (midiValue - 69) / 12) * 440;
}

//converts note name to its equivalent midi value
function noteToMIDI(noteName) {
    const noteMap = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4,
        'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9,
        'A#': 10, 'Bb': 10, 'B': 11
    };

    const match = noteName.match(/^([A-Ga-g#]+)([0-9]+)$/);
    if (!match) {
        throw new Error('Invalid note name format');
    }

    const note = match[1].toUpperCase();
    const octave = parseInt(match[2]);

    if (noteMap.hasOwnProperty(note)) {
        // Calculate the MIDI note number based on A440 tuning.
        return noteMap[note] + (octave + 1) * 12; // A440 = MIDI note 69
    } else {
        throw new Error('Invalid note name');
    }
}

//updates the gain
function updateGain(value) {

    if (gainNode) {
        gainNode.gain.setValueAtTime(value, ctx.currentTime);
    }
}

//resets note colours to original and stops calls to stop sound
function noteUp(note, isSharp) {
    const elem = document.querySelector(`[data-note="${note}"]`);
    elem.style.background = isSharp ? '#777' : 'white';
    const releaseTime = getRelease(); // in seconds
    if (activeKeys[0]) {
        noteDown(keyNoteMapping[activeKeys[activeKeys.length - 1]],)
    } else {
        releaseEnvelope(releaseTime)
        sleep(releaseTime).then(() => {
            if (!activeKeys[0]) {
                stopSound(getFrequency(noteToMIDI(note)));
            }
        });
    }

}

//controls behaviour for when a note is pressed
function noteDown(note, isSharp) {

    const elem = document.querySelector(`[data-note="${note}"]`);
    if (elem) {
        event.stopPropagation();
        elem.style.background = isSharp ? 'black' : '#ccc';
        var frequency = getFrequency(noteToMIDI(note))


        // Play the sound with the current gain
        playSound(frequency);
    }
}
function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}
//stops sound playing
function stopSound(frequency = -1) {
    if (frequency == activeFrequency || frequency == -1) {


        // Check if the oscillator exists and is still playing
        if (activeSource && activeSource.state !== 'closed') {
            // Stop and disconnect the oscillator
            activeSource.stop();
            activeSource.disconnect();

            // Remove the oscillator from the map
            activeSource = null;
        }
    }
}

function getADS() {
    var attack = document.getElementById("attack").value / 100
    var decay = document.getElementById("decay").value / 100
    var sustain = document.getElementById("sustain").value / 100


    return [attack, decay, sustain]
}
function getRelease() {
    return document.getElementById("release").value / 100
}
function updateADS() {
    const amplitude = DbToAmpl(getdB())
    const [attack, decay, sustain] = getADS()
    
    const currentTime = ctx.currentTime;
    gainNode.gain.cancelScheduledValues(currentTime);
    gainNode.gain.linearRampToValueAtTime(gainNode.gain.value, currentTime);

    gainNode.gain.linearRampToValueAtTime(amplitude, currentTime + attack);

    // Decay
    gainNode.gain.linearRampToValueAtTime(sustain * amplitude, currentTime + attack + decay);

    // Sustain (no change)


}
function releaseEnvelope(releaseTime) {

    const currentTime = ctx.currentTime;
    gainNode.gain.cancelScheduledValues(currentTime);
    gainNode.gain.linearRampToValueAtTime(gainNode.gain.value, currentTime)
    // Release
    gainNode.gain.linearRampToValueAtTime(0, currentTime + releaseTime);

}
//converts the slider value 0-100 to decibel values
function getdB() {
    // Get the roundSlider instance
    var roundSlider = $("#volume-slider").data("roundSlider");

    // Access the current value
    var sliderValue = roundSlider.getValue();
    var dbvolume = 37 * (sliderValue / 100) - 40;

    return dbvolume;
}
//converts decibels to amplitude
function DbToAmpl(dB) {
    var amplitude = 20 * 10 ** (dB / 20);
    var waveform = document.getElementById("waveform").value
    getConfig().then(configData => {
        var amplitude_multiplier = configData.config.waveAmplitudeMultiplyer[waveform]

        amplitude *= amplitude_multiplier

    }).catch(error => {
        console.error('Error getting config:', error);
    });

    return amplitude
}

//plays sound to selected frequency
function playSound(frequency) {
    getConfig()
    if (activeSource) {
        activeSource.frequency.setValueAtTime(frequency, ctx.currentTime);
        updateADS()
    } else {
        // Create an oscillator node
        const osc = ctx.createOscillator();
        osc.type = document.getElementById("waveform").value
        osc.frequency.value = frequency


        gainNode = ctx.createGain();
        updateADS()
        

        
        
        

        // Start and stop the oscillator after a short duration (adjust as needed)
        activeFilters.push(gainNode)
        osc.connect(gainNode)
        buildSignalChain()

        osc.start();
        draw();


        // Store the active source
        activeSource = osc;
    }
    activeFrequency = frequency;

}

function buildSignalChain() {
    if (activeFilters.length > 1) {
        for (var i = 0; i < activeFilters.length - 1; i++) {
            var currentNode = activeFilters[i];
            var nextNode = activeFilters[i + 1];
            currentNode.connect(nextNode);
        }
    }

    // Connect the last element in the chain to the destination
    var lastNode = activeFilters[activeFilters.length - 1];
    lastNode.connect(analyser);
    analyser.connect(ctx.destination)
}

function getModules() {

    fetch(`${serverUrl}/get_files`)
        .then(response => response.json())
        .then(files => {
            console.log(files);

        })
        .catch(error => console.error('Error fetching files:', error));
}
getModules()

const draw = () => {
    analyser.getByteTimeDomainData(dataArray);
    const segmentWidth = canvas.width / analyser.frequencyBinCount;
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.beginPath();
    c.moveTo(-100, canvas.height / 2);

    for (let i = 1; i < analyser.frequencyBinCount; i += 1) {
        let x = i * segmentWidth;
        let v = dataArray[i] / 128.0;
        let y = (v * canvas.height) / 2;
        c.lineTo(x, y);
    }

    c.lineTo(canvas.width + 100, canvas.height / 2);
    c.stroke();
    requestAnimationFrame(draw);
};






const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let gainNode = null; // Variable to store the gain node
let activeSource = null; // Variable to store the currently active source
let activeFrequency = null;

const activeKeys = []

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
        gainNode.gain.setValueAtTime(value, audioContext.currentTime);
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
        frequency = getFrequency(noteToMIDI(note))

        // Create a gain node if it doesn't exist
        if (!gainNode) {
            gainNode = audioContext.createGain();
            gainNode.connect(audioContext.destination);
        }

        // Update the gain value (you can pass any desired value)
        const amplitude = DbToAmpl(getdB())

        updateGain(amplitude);
        updateADS()
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
    attack = document.getElementById("attack").value / 100
    decay = document.getElementById("decay").value / 100
    sustain = document.getElementById("sustain").value / 100

    return attack, decay, sustain
}
function getRelease() {
    return document.getElementById("release").value / 100
}
function updateADS() {
    const amplitude = DbToAmpl(getdB())
    attack, decay, sustain, release = getADS()
    const currentTime = audioContext.currentTime;
    gainNode.gain.cancelScheduledValues(currentTime);
    gainNode.gain.linearRampToValueAtTime(gainNode.gain.value, currentTime);
    gainNode.gain.linearRampToValueAtTime(amplitude*amplitude, currentTime + attack);

    // Decay
    gainNode.gain.linearRampToValueAtTime(sustain*amplitude, currentTime + attack + decay);

    // Sustain (no change)


}
function releaseEnvelope(releaseTime) {

    const currentTime = audioContext.currentTime;
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
    waveform = document.getElementById("waveform").value

    if (waveform == "square" || waveform == "sawtooth"){
        amplitude *=0.3
    }

    return amplitude
}

//plays sound to selected frequency
function playSound(frequency) {
    if (activeSource) {
        activeSource.frequency.setValueAtTime(frequency, audioContext.currentTime);
    } else {
        // Create an oscillator node
        const oscillator = audioContext.createOscillator();

        // Set the frequency
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

        // Connect the oscillator to the gain node
        oscillator.connect(gainNode);
        oscillator.type = document.getElementById("waveform").value
        // Start and stop the oscillator after a short duration (adjust as needed)
        oscillator.start();


        // Store the active source
        activeSource = oscillator;
    }
    activeFrequency = frequency;
}

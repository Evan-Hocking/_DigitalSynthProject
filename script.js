window.alert("Caution, Please reduce device volume before use")
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let gainNode = null; // Variable to store the gain node
let activeSource = null; // Variable to store the currently active source
let activeFrequency = null;

const activeKeys = []

//maps keyboard keys to equivalent notes
const keyNoteMapping = {
    'tab': 'C4',
    '1': 'C#4',
    'q': 'D4',
    '2': 'D#4',
    'w': 'E4',
    'e': 'F4',
    '4': 'F#4',
    'r': 'G4',
    '5': 'G#4',
    't': 'A4',
    '6': 'A#4',
    'y': 'B4',
    'u': 'C5',
    '8': 'C#5',
    'i': 'D5',
    '9': 'D#5',
    'o': 'E5',
    'p': 'F5',
    '-': 'F#5',
    '[': 'G5',
    '=': 'G#5',
    ']': 'A5',
    'backspace': 'A#5',
    '#': 'B5',

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
    if (activeKeys) {
        noteDown(keyNoteMapping[activeKeys[0]],)
    }
});


// function buildKeys() {
//     var notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
//     var html = "";
//     for (var octave = 0; octave < 2; octave++) {
//         for (var i = 0; i < notes.length; i++) {
//             var hasSharp = true;
//             var note = notes[i];
//             if (note == 'E' || note == 'B') {
//                 hasSharp = false;
//             }
//             html += `<div class='whitenote'
//             onmousedown='noteDown(this.dataset.note,false)'
//             onmouseup='noteUp(this.dataset.note,false)'
//             onmouseleave='noteUp(this.dataset.note,false)'
//             data-note='${note + (octave + 4)}' id = '${note + '#' + (octave + 4)}'>`;
//             if (hasSharp) {
//                 html += `<div class='blacknote'
//             onmousedown='noteDown(this.dataset.note,true)'
//             onmouseup='noteUp(this.dataset.note,true)'
//             onmouseleave='noteUp(this.dataset.note,true)'
//             data-note='${note + '#' + (octave + 4)}' id = '${note + '#' + (octave + 4)}'></div>`;
//             }
//             html += '</div>';
//         }
//     }
//     document.getElementById('container').innerHTML = html;
    
//     $(".slider").roundSlider({
//         radius: 80,
//         circleShape: "pie",
//         sliderType: "min-range",
//         // showTooltip: false,
//         value: 50,
//         startAngle: 315,
//         min: 0,
//         max:100,
//         handleSize: "22,12",
//         handleShape: "square",
//         animation:false
//     });
    
// }


}
//applies formula to convert midi to the equivalent frequency value
function getFrequency(midiValue) {
    return Math.pow(2, (midiValue - 69) / 12) * 440;
}

//converts note name to its equivalent midi value
function noteToMIDI(noteName) {
    const noteMap = {
        'C': 0,
        'C#': 1,
        'Db': 1,
        'D': 2,
        'D#': 3,
        'Eb': 3,
        'E': 4,
        'F': 5,
        'F#': 6,
        'Gb': 6,
        'G': 7,
        'G#': 8,
        'Ab': 8,
        'A': 9,
        'A#': 10,
        'Bb': 10,
        'B': 11
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
    elem = document.querySelector(`[data-note="${note}"]`);
    elem.style.background = isSharp ? '#777' : 'white';
    stopSound(getFrequency(noteToMIDI(note)));
}

//controls behaviour for when a note is pressed
function noteDown(note, isSharp) {

    elem = document.querySelector(`[data-note="${note}"]`);
    if (elem) {
        event.stopPropagation();
        elem.style.background = isSharp ? 'black' : '#ccc';
        frequency = getFrequency(noteToMIDI(note))
        // Stop any existing sound before starting a new one

        stopSound();

        // Create a gain node if it doesn't exist
        if (!gainNode) {
            gainNode = audioContext.createGain();
            gainNode.connect(audioContext.destination);
        }

        // Update the gain value (you can pass any desired value)
        const amplitude = DbToAmpl(getdB())

        updateGain(amplitude); 

        // Play the sound with the current gain
        playSound(frequency);
    }
}

//stops sound playing
function stopSound(frequency = -1) {
    if (frequency == activeFrequency || frequency == -1) {
        // Retrieve the oscillator associated with the frequency
        const oscillator = activeSource

        // Check if the oscillator exists and is still playing
        if (oscillator && oscillator.state !== 'closed') {
            // Stop and disconnect the oscillator
            oscillator.stop();
            oscillator.disconnect();

            // Remove the oscillator from the map
            activeSource = null;
        }
    }
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
    return amplitude
}

//plays sound to selected frequency
function playSound(frequency) {
    // Create an oscillator node
    const oscillator = audioContext.createOscillator();

    // Set the frequency
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    // Connect the oscillator to the gain node
    oscillator.connect(gainNode);
    console.log(document.getElementById("waveform").value)
    oscillator.type = document.getElementById("waveform").value
    // Start and stop the oscillator after a short duration (adjust as needed)
    oscillator.start();


    // Store the active source
    activeSource = oscillator;
    activeFrequency = frequency;
}

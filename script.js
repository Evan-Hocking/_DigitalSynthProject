const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let gainNode = null; // Variable to store the gain node
let activeSource = null; // Variable to store the currently active source
function buildKeys() {
    var notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
    var html = "";
    for (var octave = 0; octave < 2; octave++) {
        for (var i = 0; i < notes.length; i++) {
            var hasSharp = true;
            var note = notes[i];
            if (note == 'E' || note == 'B') {
                hasSharp = false;
            }
            html += `<div class='whitenote'
            onmousedown='noteDown(this,false)'
            onmouseup='noteUp(this,false)'
            onmouseleave='noteUp(this,false)'
            data-note='${note + (octave + 4)}'>`;
            if (hasSharp) {
                html += `<div class='blacknote'
            onmousedown='noteDown(this,true)'
            onmouseup='noteUp(this,true)'
            onmouseleave='noteUp(this,true)'
            data-note='${note + '#' + (octave + 4)}'></div>`;
            }
            html += '</div>';
        }
    }
    document.getElementById('container').innerHTML = html;
    $(".slider").roundSlider({
        radius: 80,
        circleShape: "pie",
        sliderType: "min-range",
        // showTooltip: false,
        value: 50,
        startAngle: 315,
        min: 0,
        max:100,
        handleSize: "22,12",
        handleShape: "square",
        animation:false
    });
    
}

function getFrequency(midiValue){
    return Math.pow(2, (midiValue - 69) / 12) * 440;
}
function noteToMIDI(noteName) {
    const noteMap = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
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

function updateGain(value) {

    if (gainNode) {
        gainNode.gain.setValueAtTime(value, audioContext.currentTime);
    }
}

function noteUp(elem, isSharp) {
    elem.style.background = isSharp ? '#777' : 'white';
    stopSound();
}

function noteDown(elem, isSharp) {
    event.stopPropagation();
    var note = elem.dataset.note;
    elem.style.background = isSharp ? 'black' : '#ccc';

    // Stop any existing sound before starting a new one
    stopSound();

    // Create a gain node if it doesn't exist
    if (!gainNode) {
        gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);
    }

    // Update the gain value (you can pass any desired value)
    const amplitude =DbToAmpl(getdB())

    updateGain(amplitude); // Adjust the value based on your needs

    // Play the sound with the current gain
    playSound(getFrequency(noteToMIDI(note)));
}


function stopSound() {
    // Stop the active source if there is one
    if (activeSource) {
        activeSource.stop();
        activeSource.disconnect();
        activeSource = null;
    }
}

function getdB(){
    // Get the roundSlider instance
    var roundSlider = $("#volume-slider").data("roundSlider");

    // Access the current value
    var sliderValue = roundSlider.getValue();
    var dbvolume = 37*(sliderValue/100)-40;

    return dbvolume;
}

function DbToAmpl(dB){
    var amplitude =20* 10**(dB/20);
    return amplitude
}

function playSound(frequency) {
    // Create an oscillator node
    const oscillator = audioContext.createOscillator();

    // Set the frequency
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    // Connect the oscillator to the gain node
    oscillator.connect(gainNode);

    // Start and stop the oscillator after a short duration (adjust as needed)
    oscillator.start();


    // Store the active source
    activeSource = oscillator;
}

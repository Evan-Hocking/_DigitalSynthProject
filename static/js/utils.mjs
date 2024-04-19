//maps keyboard keys to equivalent notes
export const keyNoteMapping = {
    'tab': 'C4', '1': 'C#4', 'q': 'D4', '2': 'D#4',
    'w': 'E4', 'e': 'F4', '4': 'F#4', 'r': 'G4',
    '5': 'G#4', 't': 'A4', '6': 'A#4', 'y': 'B4',
    'u': 'C5', '8': 'C#5', 'i': 'D5', '9': 'D#5',
    'o': 'E5', 'p': 'F5', '-': 'F#5', '[': 'G5',
    '=': 'G#5', ']': 'A5', 'backspace': 'A#5', '#': 'B5',

    // Add more keys as needed
};

function getConfig(serverUrl) {
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

export function noteToMIDI(noteName) {
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

export function getdB() {
    var sliderValue = document.getElementById("volume-slider").value

    var dbvolume = 37 * (sliderValue / 100) - 40;

    return dbvolume;
}
//converts decibels to amplitude
export function DbToAmpl(dB,serverUrl) {
    var amplitude = 20 * 10 ** (dB / 20);
    var waveform = document.getElementById("waveform").value
    getConfig(serverUrl).then(configData => {
        var amplitude_multiplier = configData.config.waveAmplitudeMultiplyer[waveform]

        amplitude *= amplitude_multiplier

    }).catch(error => {
        console.error('Error getting config:', error);
    });

    return amplitude
}
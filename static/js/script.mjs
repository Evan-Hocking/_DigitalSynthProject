const serverUrl = window.location.origin;
const ctx = new (window.AudioContext || window.webkitAudioContext)();
const sampleRate = ctx.sampleRate;
let gainNode = ctx.createGain(); // Variable to store the gain node
let activeSource = ctx.createOscillator();; // Variable to store the currently active source

let activeFrequency = null;
let activeFilters = { "gainNode": gainNode }
const activeKeys = []

let availableFilters = {}

import * as util from "./utils.mjs"
import * as vis from "./visualiser.mjs"

import * as lowpass from "./filters/lowpass.mjs"
availableFilters["lowpass"] = lowpass

import * as highpass from "./filters/highpass.mjs"
availableFilters["highpass"] = highpass


const addFilter = document.getElementById('addFilter');
addFilter.addEventListener('click', event => {
    event.stopPropagation(); // Prevent the document click listener from immediately hiding the list
    showFilterList();
});

function createFilterList() {
    const filterNames = Object.keys(availableFilters);
    const filterList = document.createElement('ul');

    filterNames.forEach(filterName => {
        const listItem = document.createElement('li');
        listItem.textContent = filterName;
        listItem.addEventListener('click', () => {
            bldFilter(filterName);
            hideFilterList();
        });
        filterList.appendChild(listItem);
    });
    const filtersList = document.createElement('div')
    filtersList.id = 'filtersList'
    filtersList.appendChild(filterList)
    return filtersList;
}

function showFilterList() {
    const filterList = createFilterList();
    const addFilter = document.getElementById('addFilter');
    addFilter.insertAdjacentElement('beforebegin', filterList);
    addFilter.remove()
    // Hide the filter list when clicking outside of it
    document.addEventListener('click', hideFilterListOnClickOutside);
}

function hideFilterList() {
    const filterList = document.querySelector('#addFilter + ul');
    if (filterList) {
        filterList.remove();
        document.removeEventListener('click', hideFilterListOnClickOutside);
    }
}

// Function to hide the filter list when clicking outside of it
function hideFilterListOnClickOutside(event) {
    const filterList = document.querySelector('#addFilter + ul');
    const addFilter = document.getElementById('addFilter');
    if (filterList && !filterList.contains(event.target) && event.target !== addFilter) {
        hideFilterList();
    }
}
function bldFilter(filterName) {
    return new Promise((resolve, reject) => {
        // Build UI for the filter
        availableFilters[filterName].buildui(filterName, sampleRate, removeParentDiv)
            .then(() => {
                // Remove add-container after UI is built
                const addContainer = document.querySelector('.add-container');
                if (addContainer) {
                    addContainer.remove();
                } else {
                    reject('Add container not found');
                }
                // Build the filter
                const filter = availableFilters[filterName].buildFilter(ctx, filterName);
                // Store the filter in activeFilters
                activeFilters[filterName] = filter;
                // Resolve the promise
                resolve();
                buildAdd()
                buildSignalChain()
            })
            .catch(error => {
                reject(error);
            });
    });

}

function removeParentDiv(event) {
    // Get the parent div of the button
    const parentDiv = event.target.parentElement;
    const FilterID = parentDiv.className.replace("-container", "");
    activeFilters[FilterID].disconnect
    delete activeFilters[FilterID]



    buildSignalChain()

    // Remove the parent div
    parentDiv.remove();
}

function buildAdd() {
    const container = document.querySelector(".effects-container")
    const addContainer = document.createElement('div');
    addContainer.classList.add('add-container');

    // Create the button
    const addButton = document.createElement('button');
    addButton.id = 'addFilter';
    addButton.textContent = '+';
    addButton.addEventListener('click', showFilterList);

    // Append the button to the container div
    addContainer.appendChild(addButton);

    container.appendChild(addContainer)
}




















const analyser = ctx.createAnalyser();
analyser.smoothingTimeConstant = 0.9; // Set the smoothing time constant
analyser.fftSize = 2048;
const dataArray = new Uint8Array(analyser.frequencyBinCount);
let c = null;
document.addEventListener("DOMContentLoaded", function () {
    c = vis.buildCanvas()
});



//Event listener for the keydown event
document.addEventListener('keydown', function (event) {
    //prevents default tab behaviour since it is used for keyboard input
    if (event.key === 'Tab') {
        event.preventDefault();
    }
    const keyPressed = event.key.toLowerCase();

    //tests if key is already playing



    // Check if the pressed key is in the mapping
    if (util.keyNoteMapping.hasOwnProperty(keyPressed)) {
        if (!activeKeys.includes(keyPressed)) {
            activeKeys.push(keyPressed);
            const note = util.keyNoteMapping[keyPressed];


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
    if (util.keyNoteMapping.hasOwnProperty(keyReleased)) {
        const note = util.keyNoteMapping[keyReleased];
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



//resets note colours to original and stops calls to stop sound
function noteUp(note, isSharp) {
    const elem = document.querySelector(`[data-note="${note}"]`);
    elem.style.background = isSharp ? '#777' : 'white';
    const releaseTime = getRelease(); // in seconds
    if (activeKeys[0]) {
        noteDown(util.keyNoteMapping[activeKeys[activeKeys.length - 1]],)
    } else {
        releaseEnvelope(releaseTime)
    }

}

//controls behaviour for when a note is pressed
function noteDown(note, isSharp) {

    const elem = document.querySelector(`[data-note="${note}"]`);
    if (elem) {
        event.stopPropagation();
        elem.style.background = isSharp ? 'black' : '#ccc';
        var frequency = getFrequency(util.noteToMIDI(note))


        // Play the sound with the current gain
        playSound(frequency);
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
    const amplitude = util.DbToAmpl(util.getdB(),serverUrl)
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


//plays sound to selected frequency
function playSound(frequency) {
    const filterKeys = Object.keys(activeFilters);

    for (let i = 1; i < filterKeys.length; i++) {
        availableFilters[filterKeys[i]].updateParam(activeFilters[filterKeys[i]], filterKeys[i])

    }
    updateADS()


    if (activeFrequency) {
        activeSource.frequency.setValueAtTime(frequency, ctx.currentTime);
    } else {

        // Create an oscillator node
        // const osc = ctx.createOscillator();
        // activeSource.type = document.getElementById("waveform").value
        activeSource.frequency.value = frequency
        // Start and stop the oscillator after a short duration (adjust as needed)

        buildSignalChain()

        activeSource.start();
        vis.draw(analyser,dataArray,c);


        // Store the active source
        // activeSource = osc;
    }
    activeFrequency = frequency;

}

function buildSignalChain() {
    const filterKeys = Object.keys(activeFilters);
    activeSource.disconnect()
    for (let i = 0; i < filterKeys.length; i++) {
        activeFilters[filterKeys[i]].disconnect()
    }
    activeSource.connect(activeFilters[filterKeys[0]]);
    for (let i = 0; i < filterKeys.length - 1; i++) {
        const currentNode = activeFilters[filterKeys[i]];
        const nextNode = activeFilters[filterKeys[i + 1]];
        currentNode.connect(nextNode);
    }


    // Connect the last element in the chain to the destination
    const lastKey = filterKeys[filterKeys.length - 1];
    const lastNode = activeFilters[lastKey];
    lastNode.connect(analyser);
    analyser.connect(ctx.destination);
}


// function getModules() {

//     fetch(`${serverUrl}/get_files`)
//         .then(response => response.json())
//         .then(files => {
//             console.log(files);

//         })
//         .catch(error => console.error('Error fetching files:', error));
// }
// getModules()

const waveformSelect = document.getElementById('waveform');
waveformSelect.addEventListener('change', function (event) {
    const selectedWaveform = event.target.value;
    activeSource.type = selectedWaveform
    // You can perform actions based on the selected waveform here,
    // such as changing the waveform of an oscillator.
});
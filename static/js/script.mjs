const serverUrl = window.location.origin;
const ctx = new (window.AudioContext || window.webkitAudioContext)();
const sampleRate = ctx.sampleRate;
let gainNode = ctx.createGain(); // Variable to store the gain node
let activeSource = ctx.createOscillator(); // Variable to store the currently active source

let activeFrequency = null;
let activeFilters = { "gainNode0": gainNode }
const activeKeys = []

let availableFilters = {}

// #region Imports
import * as util from "./utils.mjs"
import * as vis from "./visualiser.mjs"

import * as lowpass from "./filters/lowpass.mjs"
availableFilters["lowpass"] = lowpass

import * as highpass from "./filters/highpass.mjs"
availableFilters["highpass"] = highpass

import * as bandpass from "./filters/bandpass.mjs"
availableFilters["bandpass"] = bandpass

import * as lowshelf from "./filters/lowshelf.mjs"
availableFilters["lowshelf"] = lowshelf

import * as highshelf from "./filters/highshelf.mjs"
availableFilters["highshelf"] = highshelf

import * as peaking from "./filters/peaking.mjs"
availableFilters["peaking"] = peaking

import * as notch from "./filters/notch.mjs"
availableFilters["notch"] = notch

import * as allpass from "./filters/allpass.mjs"
availableFilters["allpass"] = allpass

import * as reverb from "./filters/reverb.mjs"
availableFilters["reverb"] = reverb

import * as pan from "./filters/pan.mjs"
availableFilters["pan"] = pan

// #endregion


// #region FilterHandling
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
        listItem.textContent = util.capitalizeWords(filterName);
        const filterInfo = availableFilters[filterName].init()
        listItem.title = filterInfo["description"]

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

    const addTitle = document.createElement('h3')
    addTitle.textContent = "Filters"
    addTitle.style = "padding:2px;margin:1px;"
    addFilter.insertAdjacentElement('beforebegin', addTitle)

    const addNote = document.createElement('p')
    addNote.textContent = "Hover filter for more"
    addNote.style = "font-size: 7pt; padding:1px; margin: 1px;"
    addFilter.insertAdjacentElement('beforebegin', addNote)

    addFilter.insertAdjacentElement('beforebegin', filterList);

    var remove = document.createElement("button")
    remove.id = "remove"
    remove.textContent = "Remove"
    remove.addEventListener('click', removeParentDiv);
    addFilter.insertAdjacentElement('beforebegin', remove);
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

function getFilterNumber() {
    let currentURL = new URL(window.location.href);
    let params = new URLSearchParams(currentURL.search);
    let paramValues = params.getAll('nodeID');

    // If there are existing nodeID parameters in the URL, determine the filter number based on the highest number found
    if (paramValues.length > 0) {
        let maxFilterNumber = Math.max(...paramValues.map(value => parseInt(value.match(/\d+$/)[0], 10)));
        return maxFilterNumber + 1;
    } else {
        // If there are no existing nodeID parameters, return 1
        return 1;
    }
}


function bldFilter(filterName) {
    const filterNumber = getFilterNumber()

    const nodeID = filterName + filterNumber
    let currentURL = new URL(window.location.href);

    // Set the nodeID parameter
    currentURL.searchParams.append('nodeID', nodeID);

    // Update the URL without reloading the page
    window.history.pushState({ path: currentURL.href }, '', currentURL.href);
    return new Promise((resolve, reject) => {
        // Build UI for the filter
        availableFilters[filterName].buildui(nodeID, sampleRate, removeParentDiv, updateFilterParams)
            .then(() => {
                // Remove add-container after UI is built
                const addContainer = document.querySelector('.add-container');
                if (addContainer) {
                    addContainer.remove();
                } else {
                    reject('Add container not found');
                }
                // Build the filter
                const filter = availableFilters[filterName].buildFilter(ctx, nodeID);
                // Store the filter in activeFilters
                activeFilters[nodeID] = filter;
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

function removeFromURL(nodeID) {
    let currentURL = new URL(window.location.href);
    // Get all values for the parameter 'nodeID'
    let nodeIDValues = currentURL.searchParams.getAll('nodeID');
    let updatedNodeIDValues = nodeIDValues.filter(value => value !== nodeID);

    // Update the URL without reloading the page
    currentURL.searchParams.delete('nodeID');
    updatedNodeIDValues.forEach(value => currentURL.searchParams.append('nodeID', value));

    // Update the URL without reloading the page
    window.history.pushState({ path: currentURL.href }, '', currentURL.href)
}


function removeParentDiv(event) {
    const parentDiv = event.target.parentElement;
    console.log(parentDiv)
    if (parentDiv.className != "add-container") {
        const FilterID = parentDiv.className.replace("-container", "");
        removeFromURL(FilterID)


        activeFilters[FilterID].disconnect
        delete activeFilters[FilterID]



        buildSignalChain()
    }else{buildAdd()}
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

// #endregion


const analyser = ctx.createAnalyser();
analyser.smoothingTimeConstant = 0.9; // Set the smoothing time constant
analyser.fftSize = 2048;
const dataArray = new Uint8Array(analyser.frequencyBinCount);
let c = null;
document.addEventListener("DOMContentLoaded", function () {
    c = vis.buildCanvas()
});

window.addEventListener('resize', () => c = vis.buildCanvas());


// #region keyEventListeners
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

// #endregion

//applies formula to convert midi to the equivalent frequency value
function getFrequency(midiValue) {
    return Math.pow(2, (midiValue - 69) / 12) * 440;
}


// #region ADSREnvelope
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
    const amplitude = util.DbToAmpl(util.getdB(), serverUrl)
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

function updateFilterParams() {
    const nodeKeys = Object.keys(activeFilters);
    const filterKeys = nodeKeys.map(str => str.replace(/\d+$/, ''));

    for (let i = 1; i < filterKeys.length; i++) {
        availableFilters[filterKeys[i]].updateParam(activeFilters[nodeKeys[i]], nodeKeys[i], ctx)
    }
}
// #endregion

// #region noteEvent
function noteUp(note, isSharp) {
    if (inputSelect.value == "keys") {
        const elem = document.querySelector(`[data-note="${note}"]`);
        elem.style.background = isSharp ? '#292929' : 'white';
        const releaseTime = getRelease(); // in seconds
        if (activeKeys[0]) {
            noteDown(util.keyNoteMapping[activeKeys[activeKeys.length - 1]],)
        } else {
            releaseEnvelope(releaseTime)
        }

    }
}

//controls behaviour for when a note is pressed
function noteDown(note, isSharp) {
    if (inputSelect.value == "keys") {
        const elem = document.querySelector(`[data-note="${note}"]`);
        if (elem) {
            event.stopPropagation();
            elem.style.background = isSharp ? 'black' : '#ccc';
            var frequency = getFrequency(util.noteToMIDI(note))


            // Play the sound with the current gain
            playSound(frequency);
        }
    }
}

//plays sound to selected frequency
function playSound(frequency) {

    updateADS()


    if (activeFrequency) {
        activeSource.frequency.setValueAtTime(frequency, ctx.currentTime);
    } else {
        const nodeKeys = Object.keys(activeFilters);
        const filterKeys = nodeKeys.map(str => str.replace(/\d+$/, ''));

        for (let i = 1; i < filterKeys.length; i++) {
            availableFilters[filterKeys[i]].updateParam(activeFilters[nodeKeys[i]], nodeKeys[i], ctx)

        }
        // Create an oscillator node
        // const osc = ctx.createOscillator();
        // activeSource.type = document.getElementById("waveform").value
        activeSource.frequency.value = frequency
        // Start and stop the oscillator after a short duration (adjust as needed)

        buildSignalChain()

        activeSource.start();
        vis.draw(analyser, dataArray, c);


        // Store the active source
        // activeSource = osc;
    }
    activeFrequency = frequency;

}

// #endregion

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
    let currentURL = new URL(window.location.href);

    // Set the nodeID parameter
    currentURL.searchParams.set('waveform', selectedWaveform);

    // Update the URL without reloading the page
    window.history.pushState({ path: currentURL.href }, '', currentURL.href);
});

document.addEventListener('DOMContentLoaded', function () {
    let currentURL = new URL(window.location.href);
    let params = new URLSearchParams(currentURL.search);
    let paramValues = params.getAll('nodeID');

    paramValues.forEach((value, index) => {
        // Remove trailing numbers using regular expression
        removeFromURL(paramValues[index])
        paramValues[index] = value.replace(/\d+$/, ''); // Replace trailing digits with empty string
        bldFilter(paramValues[index])
    });
    var inputDevice = params.get('input')
    if (inputDevice == 'mic') {
        var sampleRate = params.get('sampleRate')
        buildMicInput(sampleRate)
        inputSelect.value = 'mic'
        sampleRateSelect.value = sampleRate
        const waveformContainer = document.getElementById('waveform-container');
        const sampleRateContainer = document.getElementById('sample-rate-container');
        const keyboardContainer = document.getElementById('keys');
        waveformContainer.style.display = 'none';
        sampleRateContainer.style.display = 'list-item';
        keyboardContainer.style.display = 'none';
        document.querySelector('.adsr-container').style.display = 'none';
    } else {
        var waveform = params.get('waveform');
        if (waveform) {
            activeSource.type = waveform
            document.getElementById("waveform").value = waveform
        }
        var octave = params.get('octave')
        if (octave) {
            activeSource.detune.value = octave * 1200
            document.getElementById('octave-display').innerHTML = octave
        }
    }
});

let btnSaveConfig = document.getElementById('btn-save-config');
btnSaveConfig.addEventListener('click', function () {
    let currentURL = new URL(window.location.href);
    let textarea = document.createElement('textarea');
    textarea.value = currentURL
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert("Copied to Clipboard")

});

let decreaseOctaveButton = document.getElementById('decreaseOctaveButton');
decreaseOctaveButton.addEventListener('click', function () {
    var detune = activeSource.detune.value

    if (detune >= -2400) {
        detune -= 1200
        activeSource.detune.value = detune
        document.getElementById('octave-display').innerHTML = detune / 1200
        let currentURL = new URL(window.location.href);

        // Set the nodeID parameter
        currentURL.searchParams.set('octave', detune / 1200);

        // Update the URL without reloading the page
        window.history.pushState({ path: currentURL.href }, '', currentURL.href);
    }
});

let increaseOctaveButton = document.getElementById('increaseOctaveButton');
increaseOctaveButton.addEventListener('click', function () {
    var detune = activeSource.detune.value
    if (detune <= 2400) {
        detune += 1200
        activeSource.detune.value = detune
        document.getElementById('octave-display').innerHTML = detune / 1200
        let currentURL = new URL(window.location.href);

        // Set the nodeID parameter
        currentURL.searchParams.set('octave', detune / 1200);

        // Update the URL without reloading the page
        window.history.pushState({ path: currentURL.href }, '', currentURL.href);
    }
});


var container = document.getElementById('container');

// Add event listener to the container for mousedown event
container.addEventListener('mousedown', function (event) {
    // Check if the event target has the class 'whitenote' or 'blacknote'
    if (event.target.classList.contains('whitenote') || event.target.classList.contains('blacknote')) {
        // Call the noteDown function passing the dataset.note value and whether it's a black note or not
        noteDown(event.target.dataset.note, event.target.classList.contains('blacknote'));
    }
});

// Add event listener to the container for mouseup event
container.addEventListener('mouseup', function (event) {
    // Check if the event target has the class 'whitenote' or 'blacknote'
    if (event.target.classList.contains('whitenote') || event.target.classList.contains('blacknote')) {
        // Call the noteUp function passing the dataset.note value and whether it's a black note or not
        noteUp(event.target.dataset.note, event.target.classList.contains('blacknote'));
    }
});

const inputSelect = document.getElementById('inputSource');
inputSelect.addEventListener('change', function (event) {
    const waveformContainer = document.getElementById('waveform-container');
    const sampleRateContainer = document.getElementById('sample-rate-container');
    const keyboardContainer = document.getElementById('keys');
    const source = event.target.value;
    const adsrContainer = document.querySelector('.adsr-container');
    activeSource.disconnect()
    let currentURL = new URL(window.location.href);
    currentURL.searchParams.set('input', source)
    if (source == "keys") {
        activeSource = ctx.createOscillator()
        buildSignalChain()
        waveformContainer.style.display = 'list-item';
        sampleRateContainer.style.display = 'none';
        keyboardContainer.style.display = 'block';
        adsrContainer.style.display = 'block';

        activeSource.type = waveformSelect.value


        // Set the nodeID parameter
        currentURL.searchParams.set('waveform', waveformSelect.value);
        currentURL.searchParams.delete('sampleRate')


        // Update the URL without reloading the page

    }
    if (source == "mic") {
        activeFrequency = null
        const sampleRate = document.getElementById('sampleRate').value;
        waveformContainer.style.display = 'none';
        sampleRateContainer.style.display = 'list-item';
        keyboardContainer.style.display = 'none';
        adsrContainer.style.display = 'none';
        currentURL.searchParams.delete('waveform')
        currentURL.searchParams.set('sampleRate', sampleRate)
        currentURL.searchParams.delete('octave')
        buildMicInput(sampleRate)
    }
    window.history.pushState({ path: currentURL.href }, '', currentURL.href);

});

const sampleRateSelect = document.getElementById('sampleRate');
sampleRateSelect.addEventListener('change', function (event) {
    buildMicInput(sampleRateSelect.value)

});


function buildMicInput(sampleRate) {
    activeSource.disconnect(); // Disconnect the existing source node

    let currentURL = new URL(window.location.href);
    currentURL.searchParams.set('sampleRate', sampleRate)
    window.history.pushState({ path: currentURL.href }, '', currentURL.href);

    // Create constraints with the new sample rate
    const constraints = {
        audio: {
            sampleRate: sampleRate, // Desired sample rate in Hz
            // Other constraints if needed
        }
    };

    // Get the media stream with the new sample rate
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function (stream) {
            // Create a new MediaStreamAudioSourceNode with the new stream
            activeSource = ctx.createMediaStreamSource(stream);

            // Rebuild the signal chain or any other necessary setup
            buildSignalChain();

            // Set up other nodes and resume audio context
            gainNode.gain.value = 1;
            gainSelect.value = 20
            vis.draw(analyser, dataArray, c);
            ctx.resume();
        })
        .catch(function (err) {
            console.error('Error accessing microphone:', err);
        });
}


const gainSelect = document.getElementById('volume-slider');
gainSelect.addEventListener('change', function (event) {
    if (inputSelect.value == "mic"){
        gainNode.gain.value = gainSelect.value/20
    }
});
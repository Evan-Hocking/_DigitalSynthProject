export function init() {
    const data = {
        name: "template",
        file: "template.mjs",
        description: "template"
    }
    return data;
}

export function buildui(filterID, sampleRate, removeParentDiv,updateFilterParams) {
    return new Promise((resolve, reject) => {
        var filterContainer = document.querySelector(".effects-container");
        var container = document.createElement("div");
        container.className = filterID + "-container"

        var FilterName = document.createElement("h3")
        FilterName.textContent = filterID
        container.appendChild(FilterName)
        

        var remove = document.createElement("button")
        remove.id = "remove"
        remove.textContent="Remove"
        remove.addEventListener('click', removeParentDiv);

        container.appendChild(remove);
        filterContainer.appendChild(container);
        resolve();
    });
}

export function getParam(filterID) {

    const frequency = document.getElementById(filterID + "freq").value
    const Q = document.getElementById(filterID + "Q").value
    return [frequency, Q]
}

export function buildFilter(ctx,filterID) {
    var filter = ctx.createBiquadFilter();
    filter.type = 'temp'
    const [freq, Qvalue] = getParam(filterID)
    filter.frequency.value = freq
    filter.Q.value = Qvalue
    return filter
}

export function updateParam(filter, filterID,ctx){
    var [freq, Qvalue] = getParam(filterID)
    filter.Q.value = Qvalue
    filter.frequency.value = freq
}


// Custom module for vibrato effect
class VibratoNode {
  constructor(audioContext, depth = 10, rate = 5) {
    this.audioContext = audioContext;
    this.depth = depth; // Depth of vibrato (in Hz)
    this.rate = rate; // Rate of vibrato (in Hz)

    // Create a gain node for controlling vibrato depth
    this.depthGain = audioContext.createGain();
    this.depthGain.gain.value = depth;

    // Create an oscillator node for vibrato modulation
    this.vibratoOscillator = audioContext.createOscillator();
    this.vibratoOscillator.frequency.value = rate;
    this.vibratoOscillator.start();

    // Connect the oscillator to the gain node
    this.vibratoOscillator.connect(this.depthGain);

    // Connect the gain node to the parameter to be modulated (e.g., oscillator frequency)
    this.output = this.depthGain;
  }

  // Set the depth of vibrato
  setDepth(value) {
    this.depth = value;
    this.depthGain.gain.value = value;
  }

  // Set the rate of vibrato
  setRate(value) {
    this.rate = value;
    this.vibratoOscillator.frequency.value = value;
  }
}

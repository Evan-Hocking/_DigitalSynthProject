export function init() {
    const data = {
        name: "Lowpass",
        file: "lowpass.mjs",
        description: "Filters out frequencies above specified value"
    }
    return data;
}

export function buildui(filterID, sampleRate) {
    return new Promise((resolve, reject) => {
        var filterContainer = document.querySelector(".effects-container");

        var container = document.createElement("div");
        container.className = filterID + "-container"

        // Create frequency slider
        var freqSlider = document.createElement("input");
        freqSlider.type = "range";
        freqSlider.id = filterID + "freq";
        freqSlider.min = 20;
        freqSlider.max = sampleRate / 10;
        freqSlider.value = sampleRate / 40;


        // Create Q slider
        var qSlider = document.createElement("input");
        qSlider.type = "range";
        qSlider.id = filterID + "Q";
        qSlider.min = 0.1;
        qSlider.max = 100;
        qSlider.value = 1;

        // Append sliders to container
        container.appendChild(freqSlider);
        container.appendChild(qSlider);
        filterContainer.appendChild(container);
        resolve();
    });
}

export function getParam(filterID) {

    console.log(document.getElementById(filterID + "freq"))
    const frequency = document.getElementById(filterID + "freq").value
    const Q = document.getElementById(filterID + "Q").value
    return [frequency, Q]
}

export function buildFilter(ctx,filterID) {
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'
    const [freq, Qvalue] = getParam(filterID)
    filter.frequency.value = freq
    filter.Q.value = Qvalue
    return filter
}

export function updateParam(filter, filterID){
    var [freq, Qvalue] = getParam(filterID)
    filter.Q.value = Qvalue
    filter.frequency.value = freq
}
export function initlowpass() {
    const data = {
        name: "Lowpass",
        file: "lowpass.js",
        description: "Filters out frequencies above specified value"
    }
    return data;
}

function builduilowpass(filterID, sampleRate) {
    var filterContainer = document.getElementById("effects-container");

    var container = document.createElement("div");
    container.id = filterID +"-container"
    
    // Create frequency slider
    var freqSlider = document.createElement("input");
    freqSlider.type = "range";
    freqSlider.id = filterID + "freq";
    freqSlider.min = 20;
    freqSlider.max = sampleRate / 2;
    freqSlider.value = sampleRate / 4;
    
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


    filterContainer.appendChild(myContainer);
}

function getParamlowpass(filterID) {
    frequency = document.getElementById(filterID + "freq").value
    Q = document.getElementById(filterID + "Q").value
    return frequency, Q
}

function buildFilterlowpass() {
    filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'
    freq, Qvalue = getParam()
    filter.frequency.value = freq
    filter.Q.value = Qvalue
    return filter
}


export function init() {
    const data = {
        name: "allpass",
        file: "allpass.mjs",
        description: "lets all frequencies through but changes phase relationship"
    }
    return data;
}

export function buildui(filterID, sampleRate, removeParentDiv) {
    return new Promise((resolve, reject) => {
        var filterContainer = document.querySelector(".effects-container");

        var container = document.createElement("div");
        container.className = filterID + "-container"

        var FilterName = document.createElement("h3")
        FilterName.textContent = 'All Pass'
        container.appendChild(FilterName)

        // Create frequency slider
        var freqcontainer = document.createElement("div")
        freqcontainer.className = "slider-container"

        const frlabel = document.createElement('label');
        frlabel.setAttribute('for', filterID+'freq');  
        frlabel.textContent = 'Frequency';
        freqcontainer.appendChild(frlabel);

        var freqSlider = document.createElement("input");
        freqSlider.type = "range";
        freqSlider.id = filterID + "freq";
        freqSlider.min = 20;
        freqSlider.max = sampleRate / 8;
        freqSlider.value = sampleRate / 32;
        freqcontainer.appendChild(freqSlider);


        // Create Q slider
        var qcontainer = document.createElement("div")
        qcontainer.className = "slider-container"

        const qlabel = document.createElement('label');
        qlabel.setAttribute('for', filterID+'Q');  
        qlabel.textContent = 'Resonance';
        qcontainer.appendChild(qlabel);

        var qSlider = document.createElement("input");
        qSlider.type = "range";
        qSlider.id = filterID + "Q";
        qSlider.min = 0.1;
        qSlider.max = 10;
        qSlider.value = 1;
        qcontainer.appendChild(qSlider)


        var remove = document.createElement("button")
        remove.id = "remove"
        remove.textContent="Remove"
        remove.addEventListener('click', removeParentDiv);

        // Append sliders to container
        container.appendChild(freqcontainer);
        container.appendChild(qcontainer);
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
    filter.type = 'allpass'
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
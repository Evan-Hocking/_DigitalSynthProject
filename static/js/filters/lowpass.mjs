export function init() {
    const data = {
        name: "Lowpass",
        file: "lowpass.mjs",
        description: "Allows frequencies below a certain cutoff frequency to pass through while attenuating higher frequencies."
    }
    return data;
}

export function buildui(filterID, sampleRate, removeParentDiv,updateFilterParams) {
    return new Promise((resolve, reject) => {
        var filterContainer = document.querySelector(".effects-container");

        var container = document.createElement("div");
        container.className = filterID + "-container"

        var FilterName = document.createElement("h3")
        FilterName.textContent = 'Low Pass'
        container.appendChild(FilterName)

        var desc = document.createElement("p")
        desc.textContent = 'Blocks high frequencies'
        desc.className = 'filter-description'
        container.appendChild(desc)

        var more = document.createElement("p")
        more.textContent = "[desc]"
        var description = init()["description"]
        more.title = description
        more.className = "hoverMore"
        container.appendChild(more)

        // Create frequency slider
        var freqcontainer = document.createElement("div")
        freqcontainer.className = "slider-container"
        freqcontainer.title = "Determines the cutoff frequency of the lowpass filter. Frequencies below this value pass through unaffected."

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
        freqSlider.addEventListener('change', updateFilterParams);
        freqcontainer.appendChild(freqSlider);


        // Create Q slider
        var qcontainer = document.createElement("div")
        qcontainer.className = "slider-container"
        qcontainer.title = "Controls the sharpness of the filter's transition between passed and attenuated frequencies."

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
        qSlider.addEventListener('change', updateFilterParams);
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
    filter.type = 'lowpass'
    const [freq, Qvalue] = getParam(filterID)
    filter.frequency.value = freq
    filter.Q.value = Qvalue
    return filter
}

export function updateParam(filter, filterID, ctx){
    var [freq, Qvalue] = getParam(filterID)
    filter.Q.value = Qvalue
    filter.frequency.value = freq
}
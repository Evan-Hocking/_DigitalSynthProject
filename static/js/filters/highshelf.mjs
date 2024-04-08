export function init() {
    const data = {
        name: "highshelf",
        file: "highshelf.mjs",
        description: "frequencies above value get boost"
    }
    return data;
}

export function buildui(filterID, sampleRate, removeParentDiv,updateFilterParams) {
    return new Promise((resolve, reject) => {
        var filterContainer = document.querySelector(".effects-container");
        var container = document.createElement("div");
        container.className = filterID + "-container"

        var FilterName = document.createElement("h3")
        FilterName.textContent = 'highshelf'
        container.appendChild(FilterName)

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
        freqSlider.max = sampleRate / 4;
        freqSlider.value = sampleRate / 8;
        freqSlider.addEventListener('change', updateFilterParams);
        freqcontainer.appendChild(freqSlider);

        var dbcontainer = document.createElement("div")
        freqcontainer.className = "slider-container"

        const dblabel = document.createElement('label');
        dblabel.setAttribute('for', filterID+'db');  
        dblabel.textContent = 'dB';
        dbcontainer.appendChild(dblabel);

        var dbSlider = document.createElement("input");
        dbSlider.type = "range";
        dbSlider.id = filterID + "db";
        dbSlider.min = -50;
        dbSlider.max = 50;
        dbSlider.value = 0;
        dbSlider.addEventListener('change', updateFilterParams);
        dbcontainer.appendChild(dbSlider);
        

        var remove = document.createElement("button")
        remove.id = "remove"
        remove.textContent="Remove"
        remove.addEventListener('click', removeParentDiv);

        container.appendChild(freqcontainer);
        container.appendChild(dbcontainer);
        container.appendChild(remove);
        filterContainer.appendChild(container);
        resolve();
    });
}

export function getParam(filterID) {

    const frequency = document.getElementById(filterID + "freq").value
    const db = document.getElementById(filterID + "db").value
    return [frequency, db]
}

export function buildFilter(ctx,filterID) {
    var filter = ctx.createBiquadFilter();
    filter.type = 'highshelf'
    const [freq, db] = getParam(filterID)
    filter.frequency.value = freq
    filter.gain.value = db
    return filter
}

export function updateParam(filter, filterID, ctx){
    var [freq, db] = getParam(filterID)
    filter.gain.value = db
    filter.frequency.value = freq
}
export function init() {
    const data = {
        name: "peaking",
        file: "peaking.mjs",
        description: "Boosts or attenuates frequencies around a specified center frequency, creating a peak or dip in the frequency response."
    }
    return data;
}

export function buildui(filterID, sampleRate, removeParentDiv,updateFilterParams) {
    return new Promise((resolve, reject) => {
        var filterContainer = document.querySelector(".effects-container");

        var container = document.createElement("div");
        container.className = filterID + "-container"

        var FilterName = document.createElement("h3")
        FilterName.textContent = 'Peaking'
        container.appendChild(FilterName)

        var desc = document.createElement("p")
        desc.textContent = 'Boosts frequency range'
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
        freqcontainer.title = "Specifies the centre frequency of the peaking filter, indicating the frequency to be boosted or attenuated."

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
        qcontainer.title = "Controls the width of the frequency band affected by the filter. Higher Q values result in narrower bands."

        const qlabel = document.createElement('label');
        qlabel.setAttribute('for', filterID+'Q');  
        qlabel.textContent = 'Width';
        qcontainer.appendChild(qlabel);

        var qSlider = document.createElement("input");
        qSlider.type = "range";
        qSlider.id = filterID + "Q";
        qSlider.min = 0.1;
        qSlider.max = 10;
        qSlider.value = 1;
        qSlider.addEventListener('change', updateFilterParams);
        qcontainer.appendChild(qSlider)

        var dbcontainer = document.createElement("div")
        dbcontainer.className = "slider-container"
        dbcontainer.title = "Sets the amount of boost or attenuation applied to the selected frequency."

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

        // Append sliders to container
        container.appendChild(freqcontainer);
        container.appendChild(qcontainer);
        container.appendChild(dbcontainer);
        container.appendChild(remove);
        filterContainer.appendChild(container);
        resolve();
    });
}

export function getParam(filterID) {

    const frequency = document.getElementById(filterID + "freq").value
    const Q = document.getElementById(filterID + "Q").value
    const db = document.getElementById(filterID + "db").value
    return [frequency, Q,db]
}

export function buildFilter(ctx,filterID) {
    var filter = ctx.createBiquadFilter();
    filter.type = 'peaking'
    const [freq, Qvalue, db] = getParam(filterID)
    filter.frequency.value = freq
    filter.Q.value = Qvalue
    return filter
}

export function updateParam(filter, filterID, ctx){
    var [freq, Qvalue,db] = getParam(filterID)
    filter.Q.value = Qvalue
    filter.gain.value = db
    filter.frequency.value = freq
}
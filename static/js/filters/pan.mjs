export function init() {
    const data = {
        name: "pan",
        file: "pan.mjs",
        description: "pan"
    }
    return data;
}

export function buildui(filterID, sampleRate, removeParentDiv,updateFilterParams) {
    return new Promise((resolve, reject) => {
        var filterContainer = document.querySelector(".effects-container");
        var container = document.createElement("div");
        container.className = filterID + "-container"

        var FilterName = document.createElement("h3")
        FilterName.textContent = "Pan"
        container.appendChild(FilterName)

        var desc = document.createElement("p")
        desc.textContent = 'Adjusts stereo field'
        container.appendChild(desc)

        var pancontainer = document.createElement("div")
        pancontainer.className = "slider-container"

        const panlabel = document.createElement('label');
        panlabel.setAttribute('for', filterID+'pan');  
        panlabel.textContent = 'Panning';
        pancontainer.appendChild(panlabel);

        var panSlider = document.createElement("input");
        panSlider.type = "range";
        panSlider.id = filterID + "pan";
        panSlider.min = -10;
        panSlider.max = 10;
        panSlider.value = 0;
        panSlider.addEventListener('change', updateFilterParams);
        
        console.log(1)
        pancontainer.appendChild(panSlider);

        var remove = document.createElement("button")
        remove.id = "remove"
        remove.textContent="Remove"
        remove.addEventListener('click', removeParentDiv);

        container.appendChild(pancontainer)
        container.appendChild(remove);
        filterContainer.appendChild(container);
        resolve();
    });
}

export function getParam(filterID) {

    const panning = document.getElementById(filterID + "pan").value/10
    return panning
}

export function buildFilter(ctx,filterID) {
    var panning = getParam(filterID)
    
    var filter = ctx.createStereoPanner();
    filter.pan.value = panning

    return filter
}

export function updateParam(filter, filterID,ctx){
    var panning = getParam(filterID)
    filter.pan.value = panning;
}



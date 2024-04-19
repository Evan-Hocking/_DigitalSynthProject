export function init() {
    const data = {
        name: "reverb",
        file: "reverb.mjs",
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
        FilterName.textContent = "Reverb"
        container.appendChild(FilterName)

        var durcontainer = document.createElement("div")
        durcontainer.className = "slider-container"

        const durlabel = document.createElement('label');
        durlabel.setAttribute('for', filterID+'dur');  
        durlabel.textContent = 'Duration';
        durcontainer.appendChild(durlabel);

        var durSlider = document.createElement("input");
        durSlider.type = "range";
        durSlider.id = filterID + "dur";
        durSlider.min = 0;
        durSlider.max = 20;
        durSlider.value = 5;
        durSlider.addEventListener('change', updateFilterParams);
        
        console.log(1)
        durcontainer.appendChild(durSlider);

        var decaycontainer = document.createElement("div")
        decaycontainer.className = "slider-container"

        const decaylabel = document.createElement('label');
        decaylabel.setAttribute('for', filterID+'decay');  
        decaylabel.textContent = 'Decay';
        decaycontainer.appendChild(decaylabel);

        var decaySlider = document.createElement("input");
        decaySlider.type = "range";
        decaySlider.id = filterID + "decay";
        decaySlider.min = 0;
        decaySlider.max = 30;
        decaySlider.value = 20;
        decaySlider.addEventListener('change', updateFilterParams);
        decaycontainer.appendChild(decaySlider);

        var remove = document.createElement("button")
        remove.id = "remove"
        remove.textContent="Remove"
        remove.addEventListener('click', removeParentDiv);

        container.appendChild(durcontainer)
        container.appendChild(decaycontainer)
        container.appendChild(remove);
        filterContainer.appendChild(container);
        resolve();
    });
}

export function getParam(filterID) {

    const duration = document.getElementById(filterID + "dur").value/10
    const decay = document.getElementById(filterID + "decay").value/10
    return [duration, decay]
}

export function buildFilter(ctx,filterID) {
    var [duration, decay] = getParam(filterID)
    var impulse = impulseResponse(duration,decay,ctx)
    var filter = new ConvolverNode(ctx,{buffer:impulse});

    return filter
}

export function updateParam(filter, filterID,ctx){
    console.log(2)
    var [duration, decay] = getParam(filterID)
    var impulse = impulseResponse(duration,decay,ctx)
    filter.buffer = impulse;
}


function impulseResponse(duration,decay,ctx){
    
    var length = ctx.sampleRate * duration;
    console.log(length)
    var impulse = ctx.createBuffer(1,length, ctx.sampleRate);
    var IR = impulse.getChannelData(0);
    for (var i=0;i<length;i++)IR[i] = (2*Math.random()-1)*Math.pow(1-i/length,decay);
    return impulse;
}
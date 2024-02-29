
const canvas = document.getElementById("canvas")  

export function buildCanvas(){ 
    

    var c = canvas.getContext("2d")


    canvas.width = window.innerWidth;
    canvas.height = 200;
    const pixelRatio = window.devicePixelRatio;
    const sizeOnScreen = canvas.getBoundingClientRect();
    canvas.width = sizeOnScreen.width * pixelRatio;
    canvas.height = sizeOnScreen.height * pixelRatio;
    canvas.style.width = canvas.width / pixelRatio + "px";
    canvas.style.height = canvas.height / pixelRatio + "px";
    c.fillStyle = "#181818";
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.strokeStyle = "#33ee55";
    c.beginPath();
    c.moveTo(0, canvas.height / 2);
    c.lineTo(canvas.width, canvas.height / 10);
    c.stroke();
    return c
}

export const draw = (analyser,dataArray,c) => {

    analyser.getByteTimeDomainData(dataArray);
    const segmentWidth = canvas.width / analyser.frequencyBinCount;
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.beginPath();
    c.moveTo(-100, canvas.height / 2);

    for (let i = 1; i < analyser.frequencyBinCount; i += 1) {
        let x = i * segmentWidth;
        let v = dataArray[i] / 128.0;
        let y = (v * canvas.height) / 2;
        c.lineTo(x, y);
    }

    c.lineTo(canvas.width + 100, canvas.height / 2);
    c.stroke();
    requestAnimationFrame(() => draw(analyser, dataArray, c));

};

const canvas = document.getElementById("canvas")  

export function buildCanvas() {
    var c = canvas.getContext("2d");

    function resizeCanvas() {
        canvas.width = window.innerWidth; // Set canvas width to window inner width
        canvas.height = 200; // Set canvas height (you can adjust this as needed)

        const pixelRatio = window.devicePixelRatio || 1; // Get the device pixel ratio
        canvas.width *= pixelRatio; // Scale canvas width by pixel ratio
        canvas.width -= 10;
        canvas.height *= pixelRatio; // Scale canvas height by pixel ratio

        canvas.style.width = (canvas.width / pixelRatio)-10 + "px"; // Set canvas CSS width
        canvas.style.height = canvas.height / pixelRatio + "px"; // Set canvas CSS height

        c.fillStyle = "#181818";
        c.fillRect(0, 0, canvas.width, canvas.height);
        c.strokeStyle = "#33ee55";
        c.beginPath();
        c.moveTo(0, canvas.height / 2);
        c.lineTo(canvas.width, canvas.height / 10);
        c.stroke();
    }

    // Initial call to resizeCanvas
    resizeCanvas();

    // Add event listener for window resize event
    window.addEventListener('resize', resizeCanvas);

    // Return the canvas context
    return c;
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
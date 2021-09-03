const colorRegex = /[a-fA-F0-9]{6}/;

var w = window.innerWidth;
var h = window.innerHeight;

let canvas = document
    .querySelector('#poly');
canvas.width = w;
canvas.height = h;

let renderThread = new Worker('renderThread.js');
renderThread.onmessage = e => render(e.data);

this.document.forms['customize'].addEventListener('submit', function(e){
    e.preventDefault();
    
    queueRender();
});

this.document.addEventListener('DOMContentLoaded', queueRender);

window.addEventListener('resize', function() { 
    w = window.innerWidth;
    h = window.innerHeight;

    canvas.width = w;
    canvas.height = h;

    queueRender();
});

function queueRender(){
    document.getElementById('loader').style.display = 'inline';
    let count = document.forms['customize'].elements['count'].value;

    renderThread.postMessage([w, h, count]);
}

function render(triangles){
    let context = canvas.getContext('2d');
    let color = document.forms['customize'].elements['color'].value;
    
    drawBackground(context, color);
    drawTriangulation(context, triangles);

    let dataUri = canvas.toDataURL("image/png");
    document.getElementById('download-link').href = dataUri;

    document.getElementById('loader').style.display = 'none';
}

function hexToRgb(color){
    let val = parseInt(color.match(colorRegex)[0], 16);
    return [val & 0xff0000, val & 0x00ff00, val & 0x0000ff]
}

function rgbToHex(r,g,b){
    var numericValue =((r << 16) | (g << 8 ) | b).toString(16);
    while (numericValue.length < 6) {
        numericValue = '0' + numericValue;
    }
    return '#' + numericValue;
}

function clamp(x, min = 0, max = 255)
{
    if(x < min) x = min;
    if(x > max) x = max;
    
    return x;
}

function palette(primary){
    let [r,g,b] = hexToRgb(primary)
    
    return [
        '#e0e0e0',
        rgbToHex(clamp(r * 1.25), clamp(g * 1.25), clamp(b * 1.25)),
        rgbToHex(r,g,b),
        rgbToHex(clamp(r * 0.6), g, clamp(b * 1.63))
    ];
}


function drawBackground(context, color){
    var background = context.createRadialGradient(w / 2, h / 2, 0.10 * h, w / 2, h / 2, 0.85 * h);

    var stops = [0, 0.2, 0.45, 1];
    var colors = palette(color);

    for (let i = 0; i < stops.length; i++) {
        background.addColorStop(stops[i], colors[i]);
    }

    context.fillStyle = background;
    context.fillRect(0, 0, w, h); 
}

function drawTriangulation(ctx, triangles){
    triangles.forEach(t => drawTriangle(ctx, t));
}

function drawTriangle(context, t){
    let [[ax,ay],[bx,by],[cx,cy]] = t;
    
    context.strokeStyle= '#303030';

    let x = (ax + bx + cx) / 3;
    let y = (ay + by + cy) / 3;

    var [r,g,b] = context.getImageData(x, y, 1, 1).data; 
    context.fillStyle = rgbToHex(r,g,b);

    context.beginPath();
    context.moveTo(ax, ay);
    context.lineTo(bx, by);
    context.lineTo(cx, cy);
    context.closePath();
    context.fill();
    context.stroke();
}

function drawPoints(points){
    let context = canvas.getContext('2d');

    for (const [x,y] of points) {
        context.moveTo(x,y);
        context.strokeStyle = '#ffffff';
        context.arc(x,y,2,0,2*Math.PI);
        context.stroke();    
    }    
}
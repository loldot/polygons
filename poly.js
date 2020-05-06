const colorRegex = /[a-fA-F0-9]{6}/;

const w = window.innerWidth;
const h = window.innerHeight;

let canvas = document
    .querySelector('#poly');

canvas.width = w;
canvas.height = h;

this.document.forms['customize'].addEventListener('submit', function(e){
    e.preventDefault();
    
    let color = e.target.elements['color'].value;
    let count = e.target.elements['count'].value;

    draw(color, count);
});

this.document.addEventListener('DOMContentLoaded', function(){
    let color = document.forms['customize'].elements['color'].value;
    let count = document.forms['customize'].elements['count'].value;

    draw(color, count);
});

function draw(color, count){
    let context = canvas.getContext('2d');
    let triangles = createPolygons(count);
    
    drawBackground(context, color);
    drawTriangulation(context, triangles);

    let dataUri = canvas.toDataURL("image/png");
    document.getElementById('download-link').href = dataUri;
}

function hexToRgb(color){
    let val = parseInt(color.match(colorRegex)[0], 16);
    return [val >> 16, (val >> 8) & 0xff, val & 0x0000ff]
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

function createPolygons(n = 10){
    let points = [];
    for (let i = 0; i < n; i++) {
        let x = Math.floor(Math.random() * w);
        let y = Math.floor(Math.random() * h);

        points.push([x,y]);
    }

    return bowyerWatson(points);
}

function bowyerWatson(points){
    let triangulation = [];
    let superTriangle = [[0,0],[w*w,0], [0,w*w]];

    triangulation.push(superTriangle);

    for (const p of points) {
        let badTriangles = [];

        triangulation.forEach(t => {
            if(isInCircumCircle(t, p)){
                badTriangles.push(t);
            }
        });

        let polygon = [];
        badTriangles.forEach(t => {
            edges(t).forEach(e => {
                if(!sharedEdge(e, badTriangles.filter(x => !isSameTriangle(x,t)))){
                    polygon.push(e);
                }
            });
        });

        badTriangles.forEach(t => {
            triangulation = triangulation.filter(x => !isSameTriangle(x,t));    
        });

        polygon.forEach(e => {
            triangulation.push([...e, p]);
        });
    }

    triangulation = triangulation.filter(t => !overlaps(superTriangle, t));

    return triangulation;
}

function isSamePoint(a,b){
    let [ax, ay] = a;
    let [bx, by] = b;

    return ax === bx && ay === by; 
}

function isSameEdge(e0,e1){
    let [[a,b],[c,d]] = [e0,e1];

    return (isSamePoint(a, c) && isSamePoint(b, d))
        || (isSamePoint(a, d) && isSamePoint(b, c));
}

function isSameTriangle(ta,tb){
    return ta.every(v0 => tb.some(v1 => isSamePoint(v0, v1)));
}

function overlaps(ta, tb){
    let overlaps = false;
    for (const [x0, y0] of ta) {
        for (const [x1, y1] of tb) {
            overlaps |= (x0 === x1) && (y0 === y1);
        }
    }
    return overlaps == 1;
}

function edges(t){
    let [a,b,c] = t;

    return [[a,b], [a,c], [b,c]];
}

function sharedEdge(e, triangles){
    let es = triangles.flatMap(t => edges(t));

    return es.length > 0 && es.some(x => isSameEdge(e,x));
}

function isInCircumCircle(t, p){
    let [[ax, ay],[bx,by],[cx,cy]] = makeCounterClockwise(t);
    let [dx, dy] = p;

    let ax_ = ax - dx;
    let ay_ = ay-dy;
    let bx_ = bx-dx;
    let by_ = by-dy;
    let cx_ = cx-dx;
    let cy_ = cy-dy;

    return (
        (ax_*ax_ + ay_*ay_) * (bx_*cy_-cx_*by_) -
        (bx_*bx_ + by_*by_) * (ax_*cy_-cx_*ay_) +
        (cx_*cx_ + cy_*cy_) * (ax_*by_-bx_*ay_)
    ) > 0;
}

function makeCounterClockwise(t){
    let [a,b,c] = t;

    if(side(a, b, c) < 0) {
        return [b, a, c];
    }

    return t;
}

function side(a,b,p){
    let [[x0,y0], [x1,y1], [x,y]] = [a,b,p];
    let [cx, cy] = [x1 - x0, y1 - y0];

    let cp = (-cy * (x - x0)) + (cx * (y - y0));

    return (cp > 0) - (cp < 0);
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

function test(){
    assertTrue(isSameEdge([[3,4], [-1,1]], [[3,4], [-1,1]]), 'AB should equal AB');
    assertTrue(isSameEdge([[3,4], [-1,1]], [[-1,1], [3,4]]), 'AB should equal BA');

    assertFalse(isSameEdge([[4,3], [-1,1]], [[3,4], [-1,1]]), 'A^-1B should not be equal to AB');

    
    let a = [1,3];
    let b = [3,2];
    let c = [2,1];

    let ab = [[1,3], [3,2]];
    let ac = [[1,3], [2,1]];
    let bc = [[3,2], [2,1]];

    assertEqual([ab,ac,bc], edges([a,b,c]), 'edges');

    assertTrue(isSameTriangle([a,b,c],[a,b,c]), 'ABC should equal ABC');
    assertTrue(isSameTriangle([b,c,a],[a,b,c]), 'BCA should equal ABC');
    assertTrue(isSameTriangle([a,c,a],[b,c,a]), 'ABC should equal BCA');

    assertTrue(sharedEdge([a,b], [[a,b,c], [a,b,c]]), 'AB should be found in ABC');
    assertTrue(sharedEdge([a,b], [[b,a,c]]), 'AB should be found in BAC');

    assertEqual([b,a,c], makeCounterClockwise([a,b,c]), 'unordered should be ordered counter-clockwise');

    assertTrue(overlaps([a,b,[-1,-1]], [b,a,[1,1]]), 'triangles on same axis overlaps');
    assertTrue(overlaps([a,[2,-1],[-1,-1]], [[1,2],a,[1,1]]), 'triangles with same point overlaps');

    assertEqual(['#e0e0e0','#00ffff','#00fffc','#00ffff'], palette('#00FFFC'),'color with leading 0 should not fail');
}

function assertTrue(actual, description){
    assertEqual(true, actual, description);
}

function assertFalse(actual, description){
    assertEqual(false, actual, description);
}

function assertEqual(expected,actual, description){
    if(JSON.stringify(expected) == JSON.stringify(actual)) console.log(`${description}: passed`);
    else console.log(`${description} failed. Expected: ${expected}, but found ${actual}`);
}
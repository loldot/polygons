onmessage = function(e){
    console.log(JSON.stringify(e.data));

    let polygons = createPolygons(...e.data);

    console.log(polygons);
    postMessage(polygons);
}

function createPolygons(maxW,maxH,n = 10){
    let points = [];
    for (let i = 0; i < n; i++) {
        let x = Math.floor(Math.random() * maxW);
        let y = Math.floor(Math.random() * maxH);

        points.push([x,y]);
    }

    return bowyerWatson(points);
}

function bowyerWatson(points){
    let max = Math.max(points.flatMap(x => x));
    let triangulation = [];
    let superTriangle = [[0,0],[1e8,0], [0,1e8]];

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

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
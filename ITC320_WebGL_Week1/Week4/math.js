"use strict";
/**
 * Generic math functions used throughout the program.
 */
const DEGREES_TO_RADIANS = Math.PI/180.0;
const RADIANS_TO_DEGREES = 180.0/Math.PI;
   
/**
 * Rotate a point or normal around the origin on the specified axis.
 * 
 * Based on equation 5.2 from:
 * @link https://sites.google.com/site/glennmurray/Home/rotation-matrices-and-formulas/rotation-about-an-arbitrary-axis-in-3-dimensions
 * @param {vec3}    point       the point to rotate.
 * @param {vec3}    axis        the axis to rotate around.
 * @param {float}   degrees     the number of degrees to rotate.
 */
function rotateAroundAxis(point, axis, degrees) {
    var radians = degrees * DEGREES_TO_RADIANS;
    var u = axis[0], v = axis[1], w = axis[2];
    var x = point[0], y = point[1], z = point[2];
    var cosd = Math.cos(radians);
    var sind = Math.sin(radians);
    var startbit = (u * x + v * y + w * z) * (1 - cosd);
    return vec3(
            u* startbit + x* cosd + (-w*y + v*z)* sind,
            v* startbit + y* cosd + (w*x-u*z)* sind,
            w * startbit + z * cosd + (-v * x + u * y) * sind
    );
}


/**
 * Calculates the surface normal of a triangle using the Psuedo-code method described in the link.
 * 
 * @link https://www.khronos.org/opengl/wiki/Calculating_a_Surface_Normal
 * @param {vec3} p1 the first point of the triangle.
 * @param {vec3} p2 the second point of the triangle.
 * @param {vec3} p3 the third point of the triangle.
 */
function CalculateSurfaceNormal (p1, p2, p3) {
    var U = subtract(p2,p1);
    var V = subtract(p3,p1);

    var n = vec3(
            (U[1] * V[2]) - (U[2] * V[1]),
            (U[2] * V[0]) - (U[0] * V[2]),
            (U[0] * V[1]) - (U[1] * V[0]));

    if(isFinite(length(n)) && length(n) > 0) {
        return normalize(n);
    }
    return n;
}
/**
 * Calculates the surface normal of a triangle using the Newell's method as described in the link.
 * 
 * @link https://www.khronos.org/opengl/wiki/Calculating_a_Surface_Normal
 * @param {vec3} p1 the first point of the triangle.
 * @param {vec3} p2 the second point of the triangle.
 * @param {vec3} p3 the third point of the triangle.
 */
function CalculateSurfaceNormalNewell (p1, p2, p3) {
    var n = vec3(0,0,0);
    var points = [p1,p2,p3];

    for(let i = 0; i < points.length; i++) {
        let v = points[i];
        let vn = points[(i+1)%points.length];
        n = add(n, vec3((v[1] - vn[1]) * (v[2] + vn[2]), (v[2] - vn[2]) * (v[0] + vn[0]) , (v[0] - vn[0]) * (v[1] + vn[1])));
    }
    return normalize(n);
}


/**
 * Gets the angle between the lines pointing to 2 points from a base point.
 * 
 * Based on solution from:
 * https://stackoverflow.com/questions/21483999/using-atan2-to-find-angle-between-two-vectors
 * @param {vec3} base the point where the angle is.
 * @param {vec3} v1 the first point.
 * @param {vec3} v2 the second point
 */
function angleBetween(base, v1, v2) {
    var a = subtract(v1, base);
    var b = subtract(v2, base);
    return Math.atan2(length(cross(a,b)), dot(a,b));
}


/**
 * Shrink (or grow) a shape by moving its lines to the left.
 * 
 * @param {vec3[]}  shape       the polygon to shrink.
 * @param {float}   amount      the distance to move the lines to the right. 
 */
function shrinkShapeXZ(shape, amount) {
    for(let i = 0; i < shape.length; i++) {
        let v = shape[i];  
        let n = shape[(i+1)%shape.length];   
        let right = getRightVector(normalize(subtract(n, v)), vec3(0,1,0)); 
        let offset = vec3(right[0] *amount, right[1] *amount, right[2] *amount);
        shape[i] = add(v, offset);
        shape[(i+1)%shape.length] = add(n, offset);
    }
}


/**
 * Get the right vector from the specified forward and up vectors.
 * 
 * @param {vec3}    forward     the forward vector.
 * @param {vec3}    up          the up vector.
 */
function getRightVector(forward, up) {
    return cross(forward,up);
}

/**
 * Check if the specified point is inside the specified polygon on the XZ plane.
 * 
 * Based on the C# code from:
 * @link https://stackoverflow.com/questions/1119627/how-to-test-if-a-point-is-inside-of-a-convex-polygon-in-2d-integer-coordinates
 * @param {vec3}    testPoint   the point to test.
 * @param {vec3[]}    polygon     the polygon to check if the point is inside.
 */
function isInConvexPolygon(testPoint, polygon) {
    var pos = 0;
    var neg = 0;

    for (let i = 0; i < polygon.length; i++) {
        // If the test point is on a polygon point, return true.
        if (equal( polygon[i] , testPoint))
            return true;

        // Define a line segment between the this point and the next.
        let x1 = polygon[i][0];
        let z1 = polygon[i][2];
        let i2 = i < polygon.length - 1 ? i + 1 : 0;
        let x2 = polygon[i2][0];
        let z2 = polygon[i2][2];
        let x = testPoint[0];
        let z = testPoint[2];

        //Compute the cross product.
        let d = (x - x1)*(z2 - z1) - (z - z1)*(x2 - x1);
        if (d > 0) pos++;
        if (d < 0) neg++;

        //If the sign changes, then point is outside.
        if (pos > 0 && neg > 0)
            return false;
    }

    // The sign/direction didn't change, so the point is inside.
    return true;
}


/**
 * Linearly interpolate between 2 floats. Not clamped.
 * 
 * @param {float} min the minimum value.
 * @param {float} max the maximum value.
 * @param {float} value the value to interpolate between the minimum (0.0) and maximum (1.0).
 */
function lerp (min, max, value) {
    var x = min + ((max-min)*value);
    return x;
}


/**
 * Pack 2 floats into a single float value to compact it 
 * into a smaller form for instance data.
 * 
 * @param {float} x the first value
 * @param {float} y the second value.
 * 
 * @returns {float} the packed floats.
 */
function pack2Floats(x, y)  { 
    return x + Math.ceil(y*50) * 65536; 
}


/**
 * Unpack 2 floats from a single float value that has been packed
 * using pack2Floats.
 * 
 * @param {float} x the first value
 * @param {float} y the second value.
 * 
 * @returns {float} the packed floats.
 */
function unpack2Floats(f)  {
    var y = f / 65536.0/50.0;
    var x = f % 65536;
    return vec2(x, y);
}


/**
 * A function for testing float packing/unpacking.
 * 
 */
function testPack2Floats() {
    var tests = [
        vec2(0.0, 3.0),
        vec2(20.0, 0.2),
        vec2(1.0, 1.0),
        vec2(1.0, 0.0),
        vec2(0.0, 1.0),
    ];

    for(var i = 0; i < tests.length; i++)
    {
        var orig = tests[i];
        var packed = pack2Floats(orig[0], orig[1]);
        var unpacked = unpack2Floats(packed);
        console.log(orig + "packed to " + packed + " and unpacked to " + unpacked);
    }

    console.log("3276801 unpacks to " + unpack2Floats(3276801));

}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}
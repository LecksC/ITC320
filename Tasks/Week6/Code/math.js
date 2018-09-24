"use strict";
/**
 * Generic math functions used throughout the program.
 */
const DEGREES_TO_RADIANS = Math.PI/180.0;
const RADIANS_TO_DEGREES = 180.0/Math.PI;

/**
 * Gets the angle between the lines pointing to 2 points from a base point.
 * 
 * Based on solution from:
 * https://stackoverflow.com/questions/21483999/using-atan2-to-find-angle-between-two-vectors
 * @param {vec3} base the point where the angle is.
 * @param {vec3} v1 the first point.
 * @param {vec3} v2 the second point.
 * 
 * @returns {float} The angle.
 */
function angleBetween(base, v1, v2) {
    var a = subtract(v1, base);
    var b = subtract(v2, base);
    return Math.atan2(length(cross(a,b)), dot(a,b));
}

/**

 * @param {vec3} v1 the first point.
 * @param {vec3} v2 the second point.
 * 
 * @returns {float} The angle.
 */
function signedAngle2D(v1, v2) {
    let angle = Math.atan2(length(cross(v1,v2)), dot(v1,v2));
    if(v1[0]*v2[2] - v1[2]*v2[0] > 0)
        angle = -angle;
    return angle;
}



/**
 * Rotate a point or normal around the origin on the specified axis.
 * 
 * Based on equation 5.2 from:
 * @link https://sites.google.com/site/glennmurray/Home/rotation-matrices-and-formulas/rotation-about-an-arbitrary-axis-in-3-dimensions
 * @param {vec3}    point       the point to rotate.
 * @param {vec3}    axis        the axis to rotate around.
 * @param {float}   degrees     the number of degrees to rotate.
 * 
 * @returns {vec3}  The point after being rotated around the axis.
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
 * Gets the minimum of each (x,y,z) component from the 2 objects.
 * 
 * Vectors must be the same size.
 * 
 * @param {float[]} a The first vector.
 * @param {float[]} b The second vector.
 * 
 * @returns {float[]}  The minimum values.
 */
function componentMin(a, b) {
    if(a.length !== b.length) {
        throw new DOMException("Vectors are not the same length.");
    }
    let ret = [];
    for(let i = 0; i < a.length; i++)
    {
        ret.push(Math.min(a[i], b[i]));
    }
    return ret;
}


/**
 * Gets the maximum of each (x,y,z) component from the 2 objects.
 * 
 * Vectors must be the same size.
 * 
 * @param {float[]} a The first vector.
 * @param {float[]} b The second vector.
 * 
 * @returns {float[]}  The maximum values.
 */
function componentMax(a, b) {
    if(a.length !== b.length) {
        throw new DOMException("Vectors are not the same length.");
    }
    let ret = [];
    for(let i = 0; i < a.length; i++)
    {
        ret.push(Math.max(a[i], b[i]));
    }
    return ret;
}

/**
 * Gets the maximum of each (x,y,z) component from the 2 objects.
 * 
 * Vectors must be the same size.
 * 
 * @param {vec3} unit The first vector.
 * 
 * @returns {vec3}  The euler angles in degrees.
 */
function eulerFromUnitVector(unit) {
    let rise = unit[1];
    let run = Math.sqrt(unit[0]*unit[0] + unit[2]*unit[2]);
    let slope = 0;
    if(run > 0)
        slope = Math.atan(rise/run);
    let unit2d = vec3(unit[0], 0, unit[2]);

    let angle2d = signedAngle2D(vec3(0,0,1), unit2d);

    return vec3(slope * RADIANS_TO_DEGREES,angle2d * RADIANS_TO_DEGREES, 0);
}

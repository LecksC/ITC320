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
    let slope = 90;
    if(run > 0)
        slope = Math.atan(rise/run);
    let unit2d = vec3(unit[0], 0, unit[2]);

    let angle2d = signedAngle2D(vec3(0,0,1), unit2d);

    return vec3(-slope * RADIANS_TO_DEGREES,angle2d * RADIANS_TO_DEGREES, 0);
}


/**
 * Multiplies a vector3 by a matrix as a position (including translation).
 * 
 * @param {vec3} point The vector4 to transform.
 * @param {mat4} matrix The transformation matrix.
 * 
 * @returns {vec3} The transformed vector.
 */
function transformPosition(point, matrix)
{
    let vert = transform([point[0], point[1], point[2], 1.0], matrix);
    vert[0] /= vert[3];
    vert[1] /= vert[3];
    vert[2] /= vert[3];
    return vec3(vert[0], vert[1], vert[2]);
}


/**
 * Multiplies a vector3 by a matrix as a vector (no translation).
 * 
 * @param {vec3} point The vector4 to transform.
 * @param {mat4} matrix The transformation matrix.
 * 
 * @returns {vec3} The transformed vector.
 */
function transformVector(point, matrix)
{
    let vert = transform([point[0], point[1], point[2], 0.0], matrix);
    return vec3(vert[0], vert[1], vert[2]);
}


/**
 * Multiplies a vector4 by a matrix.
 * 
 * @param {vec4} vector The vector4 to transform.
 * @param {mat4} matrix The transformation matrix.
 * 
 * @returns {vec4} The transformed vector.
 */
function transform(vector, matrix) {
    if(vector.length !== 4) {
        throw DOMException("vector must be a vector4");
    }
   //return [
   //    vector[0] * matrix[0][0] + vector[1] * matrix[1][0] + vector[2] * matrix[2][0] + vector[3] * matrix[3][0],
   //    vector[0] * matrix[0][1] + vector[1] * matrix[1][1] + vector[2] * matrix[2][1] + vector[3] * matrix[3][1],
   //    vector[0] * matrix[0][2] + vector[1] * matrix[1][2] + vector[2] * matrix[2][2] + vector[3] * matrix[3][2],
   //    vector[0] * matrix[0][3] + vector[1] * matrix[1][3] + vector[2] * matrix[2][3] + vector[3] * matrix[3][3]];
       return [
        vector[0] * matrix[0][0] + vector[1] * matrix[0][1] + vector[2] * matrix[0][2] + vector[3] * matrix[0][3],
        vector[0] * matrix[1][0] + vector[1] * matrix[1][1] + vector[2] * matrix[1][2] + vector[3] * matrix[1][3],
        vector[0] * matrix[2][0] + vector[1] * matrix[2][1] + vector[2] * matrix[2][2] + vector[3] * matrix[2][3],
        vector[0] * matrix[3][0] + vector[1] * matrix[3][1] + vector[2] * matrix[3][2] + vector[3] * matrix[3][3]];
}


/**
 * Returns the nearest intersection between the given ray and the given bounding box.
 * 
 * @param {BoundingBox} bounds      The bounding box to intercept against
 * @param {vec3}        rayStart    The start position of the ray to check.
 * @param {vec3}        rayEnd      The end position of the ray to check.
 * 
 * @returns {vec3} the intersection if there is one, otherwise null.
 */
function lineSegmentIntersectsAxisAlignedCenteredBox(bounds, rayStart, rayEnd)
{
    //console.log("Checking intersection:");
    //console.log(bounds);
    //console.log(rayStart);
    //console.log(rayEnd);
    let lineVector = normalize(subtract(rayEnd, rayStart));
    let intersection = null;
    let closestDistance = magnitude(subtract(rayStart, rayEnd));
    let minmax = [bounds.min, bounds.max];
    for(let i = 0; i < 3; i++) {
        for(let m = 0; m < 2; m++)
        {
            let minOrMax = minmax[m];
            let planePoint = vec3(0,0,0);
            planePoint[i] = minOrMax[i];
            let planeNormal = vec3(0,0,0);
            planeNormal[i] = 1;
            let planeIntersect = lineIntersectPlane(planePoint, planeNormal, rayStart, lineVector);
            if(planeIntersect !== null)
            {
                
               // console.log("Intersected a plane");
                let culled = false;
                for(let t = 0; t < 3; t++)
                {
                    if(t===i)
                        continue;
                    if(planeIntersect[t] <= bounds.max[t] && planeIntersect[t] >= bounds.min[t])
                    {
                        continue;
                    }
                    culled = true;
                }
                if(!culled)
                {
                  //  console.log("Intersected a square");
                    let distance = magnitude(subtract(planeIntersect, rayStart));
                    if(distance <= closestDistance) {
                        intersection = planeIntersect;
                        closestDistance = distance;
                    }
                }
            }
        }
    }
    return intersection;
}


/**
 * Returns the intersection point of a line and a plane (if there is one), otherwise null.
 * 
 * Based on an answer from https://stackoverflow.com/questions/5666222/3d-line-plane-intersection
 * 
 * @param {vec3} planePoint A point on the plane.
 * @param {vec3} planeNormal The plane normal.
 * @param {vec3} linePoint A point on the line.
 * @param {vec3} lineVector The line direction.
 * 
 * @returns {vec3} The intersection point, or null if none.
 */
function lineIntersectPlane(planePoint, planeNormal, linePoint, lineVector)
{
    let u = lineVector;
    let dotp = dot(planeNormal, u);
    if (Math.abs(dotp) > 0.00001)
    {
        // the factor of the point between p0 -> p1 (0 - 1)
        // if 'fac' is between (0 - 1) the point intersects with the segment.
        // otherwise:
        //  < 0.0: behind p0.
        //  > 1.0: infront of p1.
        let w = subtract(linePoint, planePoint);
        let fac = -dot(planeNormal, w) / dotp;
        u = scale(fac, u);
        return add(linePoint,  u);
    }
    else {
        return null;
    }
}


/**
 * Returns the magnitude/length of a vector3.
 * 
 * @param {vec3}    vector  The vector3 to get the length of.
 * 
 * @returns {float} The length of the vector.
 */
function magnitude(vector)
{
    return Math.sqrt(vector[0]*vector[0] + vector[1]*vector[1] + vector[2]*vector[2]);
}


/**
 * NOT WORKING!! Needs more testing.
 * Finds the nearest intersect between a line and an axis aligned bounding box.
 * 
 * @param {BoundingBox}     bounds          The bounding box to raycast against.
 * @param {vec3}            rayPoint        The start point of the ray.
 * @param {vec3}            rayDirection    The direction of the ray.
 * @param {float}           rayDistance     The maximum distance along the ray for collisions.
 * 
 * @returns {vec3} The collision point, or null if none.
 */
function rayCastAABB(bounds, rayPoint, rayDirection, rayDistance)
{
    let mins = [];
    let maxs = [];
    for(let i = 0; i < 3; i++)
    {
        if(rayDirection[i] === 0) {
            continue;    
        }
        let t1 = (bounds.min[i] - rayPoint[i]) / rayDirection[i];
        let t2 = (bounds.max[i] - rayPoint[i]) / rayDirection[i];
        mins.push(Math.min(t1, t2));
        maxs.push(Math.max(t1, t2));
    }
    let tMax = minNumber(maxs);
    let tMin = maxNumber(mins);
    if (tMax< 0) {
        return null;
    }
    if (tMin>tMax) {
        return null;
    }
    if (tMin< 0.0) {
        return add(rayPoint, scale(tMax, rayDirection));
    }
    return add(rayPoint, scale(tMin, rayDirection));
}


/**
 * Normalizes a vector without destroying the original vector.
 * 
 * @param {vec3} u The vector to normalize.
 * @param {bool} excludeLastComponent Whether or not to exclude the last element from the calculation.
 * 
 * @returns {vec3} The original vector.
 * @throws an exception if the vector has zero length.
 */
function normalized( u, excludeLastComponent )
{
    let t = [0,0,0];

    if ( excludeLastComponent ) {
        var last = u.pop();
    }

    var len = length( u );

    if ( !isFinite(len) ) {
        throw "normalize: vector " + u + " has zero length";
    }

    for ( var i = 0; i < u.length; ++i ) {
        t[i] = u[i] / len;
    }

    if ( excludeLastComponent ) {
        u.push( last );
        t.push(last);
    }

    return t;
}


/**
 * Returns the minimum value from an array of at least 1 numbers.
 * 
 * @param {number[]} array The array of numbers.
 * 
 * @returns {number} The lowest number.
 * 
 * @throws an exception if the matrix is empty.
 */
function minNumber(array)
{
    if(array.length === 0){
        throw DOMException("0 length array.");
    }
    let val = array[0];
    for(let i = 1; i < array.length; i++)
    {
        val = Math.min(val, array[i]);
    }
    return val;
}


/**
 * Returns the maximum value from an array of at least 1 numbers.
 * 
 * @param {number[]} array The array of numbers.
 * 
 * @returns {number} The highest number.
 * 
 * @throws an exception if the matrix is empty.
 */
function maxNumber(array)
{
    if(array.length === 0){
        throw DOMException("0 length array.");
    }
    let val = array[0];
    for(let i = 1; i < array.length; i++)
    {
        val = Math.max(val, array[i]);
    }
    return val;
}

/**
 * DOES NOT WORK!!!
 * Interpolates between 2 matrices.
 * 
 * @param {matrix}  a        The first matrix.
 * @param {matrix}  b        The second matrix.
 * @param {float}   lerp     The interpolation value.
 * 
 * @returns {matrix} the interpolated matrix.
 * 
 */
function lerpMatrix(a,b,lerp)
{
    lerp = Math.max(0, Math.min(1, lerp));
    return [[a[0][0]*lerp + b[0][0]*(1-lerp), a[0][1]*lerp + b[0][1]*(1-lerp), a[0][2]*lerp + b[0][2]*(1-lerp), a[0][3]*lerp + b[0][3]*(1-lerp) ],
            [a[1][0]*lerp + b[1][0]*(1-lerp), a[1][1]*lerp + b[1][1]*(1-lerp), a[1][2]*lerp + b[1][2]*(1-lerp), a[1][3]*lerp + b[1][3]*(1-lerp) ],
            [a[2][0]*lerp + b[2][0]*(1-lerp), a[2][1]*lerp + b[2][1]*(1-lerp), a[2][2]*lerp + b[2][2]*(1-lerp), a[2][3]*lerp + b[2][3]*(1-lerp) ],
            [a[3][0]*lerp + b[3][0]*(1-lerp), a[3][1]*lerp + b[3][1]*(1-lerp), a[3][2]*lerp + b[3][2]*(1-lerp), a[3][3]*lerp + b[3][3]*(1-lerp) ]];
}
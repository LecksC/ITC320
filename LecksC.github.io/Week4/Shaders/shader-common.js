"use strict";
/**
 * Various pieces of shader code that are used in multiple shaders.
 * 
 * @author Lecks Chester
 */
const shaderHeader = `
#define M_PI 3.1415926535897932384626433832795
precision highp float;
`;

/**
 * Rotates a point or normal around an axis.
 * 
 * @param	{vec3}	point		the point or normal to rotate.
 * @param	{vec3}	axis		the axis to rotate around.
 * @param	{float}	degrees		the amount to rotate (in degrees).
 * 
 * @returns	{vec3}		the rotated vector.
 */
const shaderRotateFunction = `
vec3 rotateAroundAxis(vec3 point, vec3 axis, float degrees) {
	float radians = degrees * (M_PI/180.0);
	float u = axis.x, v = axis.y, w = axis.z;
	float x = point.x, y = point.y, z = point.z;
	float cosd = cos(radians);
	float sind = sin(radians);
	float  startbit = (u * x + v * y + w * z) * (1.0 - cosd);
	return vec3(
			u* startbit + x* cosd + (-w*y + v*z)* sind,
			v* startbit + y* cosd + (w*x-u*z)* sind,
			w * startbit + z * cosd + (-v * x + u * y) * sind
	);
}
`;


/**
 * Unpacks 2 floats from the given float that has been packed by pack2Floats in math.js.
 * 
 * @param	{float}	f	the normal to calculate lighting for in world space.
 * 
 * @returns	{vec2}		the 2 unpacked float values.
 */
const shaderUnpackFunction = `
vec2 unpack2Floats(float f)  {
	float y = f / 65536.0/50.0;
	float x = mod(f,65536.0);
	return vec2(x, y);
}
`;


/**
 * Calculates the lighting for a given normal in world space.
 * 
 * This is a simplified version of the lighting described at 
 * @link https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Lighting_in_WebGL
 * @param	{vec3}	normal		the normal to calculate lighting for in world space.
 * 
 * @returns	{vec3}	light		the light value to be applied to the vertex or pixel.
 */
const shaderLightFunction = `
vec3 getLighting(vec3 normal)  {
    highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
    highp vec3 directionalLightColor = vec3(1, 1, 1);
    highp vec3 directionalVector = normalize(vec3(0.2, -1,2));
    highp float directional = max(dot(normal.xyz, directionalVector), 0.0);
    return ambientLight + (directionalLightColor * directional);
}
`;
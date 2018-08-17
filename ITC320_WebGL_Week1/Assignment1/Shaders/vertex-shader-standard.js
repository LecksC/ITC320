"use strict";
/**
 * Standard vertex shader that extracts a 2d offset, 1d rotation and 2d scale from a float4.
 * 
 * Supports instancing.
 * 
 * @author Lecks Chester
 */

Game.GLSL.vsStandard = 
shaderHeader + `
attribute vec4 aPosition;
attribute vec2 aUV;
uniform mat4 uViewProjectionMatrix;

attribute mat4 aInstanceWorldMatrix;

varying highp vec2 vTexCoords;

void main() {
	mat4 wvp =  uViewProjectionMatrix * aInstanceWorldMatrix;
	gl_Position = wvp * aPosition;
	vTexCoords = aUV;
}
`;



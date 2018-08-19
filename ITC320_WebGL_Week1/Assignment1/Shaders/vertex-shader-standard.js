"use strict";
/**
 * Standard vertex shader that uses a attribute for the world matrix (for hardware instancing).
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

varying vec2 vTexCoords;

void main() {
	mat4 wvp =  uViewProjectionMatrix * aInstanceWorldMatrix;
	gl_Position = wvp * aPosition;
	vTexCoords = aUV;
}
`;



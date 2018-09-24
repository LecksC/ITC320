"use strict";
/**
 * Standard vertex shader that uses a attribute for the world matrix (for hardware instancing).
 * 
 * Supports instancing.
 * 
 * @author Lecks Chester
 */

Game.GLSL.vsColor = 
shaderHeader + `
attribute vec4 aPosition;
attribute vec3 aColor;
uniform mat4 uViewProjectionMatrix;

attribute mat4 aInstanceWorldMatrix;

varying vec3 vColor;

void main() {
	mat4 wvp =  uViewProjectionMatrix * aInstanceWorldMatrix;
	gl_Position = wvp * aPosition;
	vColor = aColor;
}
`;



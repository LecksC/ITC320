"use strict";
/**
 * Standard vertex shader that extracts a 2d offset, 1d rotation and 2d scale from a float4.
 * 
 * Supports instancing.
 * 
 * @author Lecks Chester
 */

var vertexShaderGLSL = 
shaderHeader + 
shaderRotateFunction + 
shaderUnpackFunction + 
shaderLightFunction + `
attribute vec4 aPosition;
//attribute vec3 aNormal;
//attribute vec3 aColor;
attribute vec2 aUV;
uniform mat4 uViewProjectionMatrix;

attribute mat4 aInstanceWorldMatrix;

varying highp vec4 vNormal;
varying highp vec2 vTexCoords;

void main() {

	mat4 wvp = uViewProjectionMatrix * aInstanceWorldMatrix;
	gl_Position = wvp * aPosition;

//	vNormal = wvp * vec4(aNormal, 0.0);
	vTexCoords = aUV;
}
`;

var script = document.createElement('script');
script.id="vertex-shader";
script.type = "x-shader/x-vertex";
script.innerHTML = vertexShaderGLSL;
document.getElementsByTagName('head')[0].appendChild(script);


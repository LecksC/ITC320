"use strict";
/**
 * Simple fragment shader that displays the colour passed in from the vertex shader.
 * 
 * @author Lecks Chester
 */
var script = document.createElement('script');
script.id="fragment-shader";
script.type = "x-shader/x-vertex";
var fragmentShaderGLSL = 
shaderHeader +`
varying highp vec3 vVertexColor;

void main() {
	gl_FragColor = (vec4(vVertexColor,1.0));
}
`;
script.innerHTML = fragmentShaderGLSL;
document.getElementsByTagName('head')[0].appendChild(script);
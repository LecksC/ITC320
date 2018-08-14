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
varying highp vec2 vTexCoords;
uniform sampler2D uTextureSampler;
void main() {
	gl_FragColor = texture2D(uTextureSampler, vTexCoords);// (vec4(vTexCoords.xy, 0.0, 1.0));
}
`;
script.innerHTML = fragmentShaderGLSL;
document.getElementsByTagName('head')[0].appendChild(script);
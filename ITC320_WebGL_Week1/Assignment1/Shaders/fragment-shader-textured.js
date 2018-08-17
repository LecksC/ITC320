"use strict";
/**
 * Simple fragment shader that displays the colour passed in from the vertex shader.
 * 
 * @author Lecks Chester
 */

Game.GLSL.fsTextured = 
shaderHeader +`
varying highp vec2 vTexCoords;
uniform sampler2D uTextureSampler;

void main() {
	vec4 color = texture2D(uTextureSampler, vTexCoords);
	gl_FragColor = color;
}
`;
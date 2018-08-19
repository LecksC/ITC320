"use strict";
/**
 * Fragment shader that displays a texture.
 * 
 * @author Lecks Chester
 */

Game.GLSL.fsTextured = 
shaderHeader +`
varying vec2 vTexCoords;
uniform sampler2D uTextureSampler;

void main() {
	vec4 color = texture2D(uTextureSampler, vTexCoords);
	gl_FragColor = color;
}
`;
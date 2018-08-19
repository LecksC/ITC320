"use strict";
/**
 * Fragment shader that merges a texture with a tiled version of itself.
 * 
 * @author Lecks Chester
 */

Game.GLSL.fsGround = 
shaderHeader +`
varying vec2 vTexCoords;
uniform sampler2D uTextureSampler;

void main() {
	vec4 color = texture2D(uTextureSampler, vTexCoords);
	color *= texture2D(uTextureSampler, vTexCoords*200.0);
	gl_FragColor = color;
}
`;
"use strict";
/**
 * Fragment shader that displays a texture.
 * 
 * @author Lecks Chester
 */

Game.GLSL.fsColor = 
shaderHeader +`
varying vec3 vColor;

void main() {
	gl_FragColor = vec4(vColor.xyz,1.0);
}
`;
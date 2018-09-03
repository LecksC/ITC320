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
	vec4 color = texture2D(uTextureSampler, vTexCoords);

	
	//color masking
	vec3 diff = color.xyz - vec3(227.0/255.0, 39.0/255.0, 229.0/255.0);
	if(diff.x*diff.x + diff.y*diff.y + diff.z*diff.z < 0.325)
	{
		discard;
	}

	//alpha masking to help with depth buffer issues:
	if(color.a < 1.0) {
		discard;
	}
	color.a = 1.0;
	gl_FragColor = color;

}
`;
script.innerHTML = fragmentShaderGLSL;
document.getElementsByTagName('head')[0].appendChild(script);
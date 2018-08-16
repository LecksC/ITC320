"use strict";
/**
 * Simple fragment shader that displays the colour passed in from the vertex shader.
 * 
 * @author Lecks Chester
 */
var script = document.createElement('script');
script.id="fragment-shader";
script.type = "x-shader/x-vertex";
var fragmentShaderGLSL_CarPaint = 
shaderHeader +`
varying highp vec2 vTexCoords;
uniform sampler2D uTextureSampler;

uniform float uTime;
void main() {

	vec4 color = texture2D(uTextureSampler, vTexCoords);

	vec4 red = color.rgba;
	vec4 green = color.grba;
	vec4 blue = color.gbra;
	
	// No modulo in WebGL1.
	float time = uTime - 9.0*floor(uTime/9.0);
	float redness = 1.0-min(1.0, max(0.0, time/3.0  ));
	redness = redness + min(1.0, max(0.0,(time-6.0)/3.0));
	float blueness = min(1.0, max(0.0, min(1.0, max(0.0, (time-3.0)/3.0 ))- redness));
	float greenness = min(1.0, max(0.0, 1.0 - blueness - redness));

	color = red*redness + blue*blueness + green*greenness;
	//color masking
	//vec3 diff = color.xyz - vec3(227.0/255.0, 39.0/255.0, 229.0/255.0);
	//if(diff.x*diff.x + diff.y*diff.y + diff.z*diff.z < 0.325)
	//{
	//	discard;
	//}

	gl_FragColor = color;

	//alpha blending
	//gl_FragColor = texture2D(uTextureSampler, vTexCoords);
}
`;
script.innerHTML = fragmentShaderGLSL_CarPaint;
document.getElementsByTagName('head')[0].appendChild(script);
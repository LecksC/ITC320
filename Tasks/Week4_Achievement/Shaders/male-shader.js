"use strict";
/**
 * Simple fragment shader that displays the colour passed in from the vertex shader.
 * 
 * @author Lecks Chester
 */
var script = document.createElement('script');
script.id="fragment-shader";
script.type = "x-shader/x-vertex";
var fragmentShaderGLSL_Male = 
shaderHeader +`
varying highp vec2 vTexCoords;
uniform sampler2D uTextureSampler;

uniform vec3 uTintColor;
void main() {
	vec4 color = texture2D(uTextureSampler, vTexCoords);

	vec3 diff = color.xyz - vec3(227.0/255.0, 39.0/255.0, 229.0/255.0);
	float brightness = (color.x + color.y + color.z)/3.0;
	
	float greenness =  normalize(color).g - (normalize(color).r + normalize(color).b) * 0.5;
	greenness *= greenness;
	greenness = min(1.0, max(0.0, greenness* 150.0));
	vec3 destcolor = uTintColor * brightness;

	color.xyz = mix(color.xyz,destcolor, greenness) ;
	//color.xyz = vec3(greenness, greenness, greenness);

	gl_FragColor = color;
}
`;
script.innerHTML = fragmentShaderGLSL_Male;
document.getElementsByTagName('head')[0].appendChild(script);
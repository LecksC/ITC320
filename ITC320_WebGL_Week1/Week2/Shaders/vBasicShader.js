var vBasicShaderCode  =`
attribute vec3 aPosition; 
//attribute vec3 aColour;

uniform float uTime;
uniform mat4 umWorldMatrix;
uniform mat4 umViewMatrix;
uniform mat4 umProjMatrix;

varying vec3 vWorldPos;
varying float vTime;
void main() 
{
	vec4 worldPos = umWorldMatrix*vec4(aPosition,1.0);
	vec4 transformedPos = umProjMatrix*umViewMatrix*worldPos;
	gl_Position = transformedPos;
	vWorldPos = worldPos.xyz;
	vTime = uTime;
     
}`;

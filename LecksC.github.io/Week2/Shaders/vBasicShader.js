var vBasicShaderCode  =`
attribute vec3 aPosition; 
//attribute vec3 aColour;

uniform float uTime;
uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

varying vec3 vWorldPos;
varying float vTime;
void main() 
{
	vec4 worldPos = uWorldMatrix*vec4(aPosition,1.0);
	vec4 transformedPos = uProjMatrix*uViewMatrix*worldPos;
	gl_Position = transformedPos;
	vWorldPos = worldPos.xyz;
	vTime = uTime;
     
}`;

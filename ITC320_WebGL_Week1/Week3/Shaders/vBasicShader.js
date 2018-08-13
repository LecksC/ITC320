var vBasicShaderCode  =`
attribute vec3 aPosition; 
attribute vec3 aUV;

uniform float uTime;
uniform mat4 uWorldMatrix;
uniform mat4 uViewProjectionMatrix;

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

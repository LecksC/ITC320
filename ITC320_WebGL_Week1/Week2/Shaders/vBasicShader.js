var vBasicShaderCode  =`
attribute vec3 aPosition; 
//attribute vec3 aColour;
varying vec3 vColour;
uniform mat4 umWorldMatrix;
uniform mat4 umViewMatrix;
uniform mat4 umProjMatrix;
void main() 
{
	vec4 transformedPos = umProjMatrix*umViewMatrix*umWorldMatrix*vec4(aPosition,1.0);
	gl_Position = transformedPos;
	float dist = transformedPos.z;
	vColour= mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0, 1.0), dist/10.0);
     
}`;

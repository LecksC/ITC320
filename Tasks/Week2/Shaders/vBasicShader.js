var vBasicShaderCode  =`
attribute vec3 aPosition; 
//attribute vec3 aColour;

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

varying vec3 vColour;
void main() 
{
	vec4 worldPos = uWorldMatrix*vec4(aPosition,1.0);
	vec4 transformedPos = uProjMatrix*uViewMatrix*worldPos;
	gl_Position = transformedPos;

    vColour= mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0, 1.0), (transformedPos.z-5.0)/10.0);

}`;

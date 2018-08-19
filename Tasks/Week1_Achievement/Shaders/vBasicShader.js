var vBasicShaderCode  =`
attribute vec2 aPosition; 
attribute vec3 aColour;
varying vec3 vColour;
void 
main() 
{
	vColour=aColour;
    gl_Position = vec4(aPosition,0.0,1.0); 
}`;

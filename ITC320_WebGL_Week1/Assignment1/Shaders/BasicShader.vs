attribute vec4 vPosition; 
attribute vec2 vColour;
varying vec2 col;
uniform mat4 mWorldMatrix;
void main() 
{
	col=vColour;
    gl_Position = mWorldMatrix*vPosition; 
}

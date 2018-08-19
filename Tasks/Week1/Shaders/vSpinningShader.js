var vSpinningShaderCode  =`
attribute vec2 aPosition; 
attribute vec3 aColour;
varying vec3 vColour;
uniform float uRotation;
uniform vec2 uPivot;

void main() 
{
    float sinr = sin(uRotation);
    float cosr = cos(uRotation);
    mat4 rot = mat4(
            cosr,   -sinr,   0.0,   0.0,
            sinr,   cosr,    0.0,   0.0,
            0.0,    0.0,     1.0,   0.0,
            0.0,    0.0,     0.0,   1.0);
	vColour=aColour;
    gl_Position = vec4(aPosition - uPivot,0.0,1.0) * rot + vec4(uPivot,0.0,0.0); 
}`;

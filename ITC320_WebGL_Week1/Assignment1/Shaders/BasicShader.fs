precision mediump float; 
varying vec2 col;
uniform sampler2D uSampler;

void main() 
{ 
    gl_FragColor = texture2D(uSampler, col); 
}
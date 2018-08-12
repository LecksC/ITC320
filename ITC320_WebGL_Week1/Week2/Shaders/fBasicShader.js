var fBasicShaderCode =`
precision mediump float; 
varying float vTime;
varying vec3 vWorldPos;
void main() 
{ 
    float redStart = -0.5;
    float redSize = 1.2;
    float redScale = 1.0/redSize;
    redStart += sin(vTime);
    float posInRed = vWorldPos.z - redStart;
    posInRed *= redScale;
    posInRed = min(1.0, max(0.0, posInRed));
    posInRed *= 3.14 ;
    posInRed = sin(posInRed);

    gl_FragColor = vec4( mix( vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0),1.0-posInRed  ), 1.0); 
}`;
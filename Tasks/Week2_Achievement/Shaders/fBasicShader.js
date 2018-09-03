var fBasicShaderCode =`
precision mediump float; 
varying float vTime;
varying vec3 vWorldPos;
void main() 
{ 
    float start = 0.0;
    float size = 5.0;
    float center = sin(vTime) * 0.5 + 0.5;
    float z = (-vWorldPos.z + start )/size;
    float redness = abs((z - center) * 3.0);
    z *= z*z*z*z*z*z*z*z*z*z*z*z*z*z*z*z*z;
   redness = min(1.0, max(0.0, redness ));
   // posInRed *= redScale;
   // posInRed = min(1.0, max(0.0, posInRed));
   // posInRed *= 3.14 ;   // posInRed *= redScale;
   // posInRed = min(1.0, max(0.0, posInRed));
   // posInRed *= 3.14 ;
    float red = 0.0;
    if(redness > 0.5)
    {
        red = 1.0;
    };
    gl_FragColor = vec4( mix( vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0),red ), 1.0 ); 
}`;
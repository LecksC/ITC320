"use strict";
/**
 * Represents a compiled shader and contains references to attributes and uniform values.
 * 
 * @author  Lecks Chester
 */
class Shader { 
    constructor(vertexShaderName, fragmentShaderName) {
        // Load shader.
        this.program = initShaders(gl, vertexShaderName, fragmentShaderName); 
        // Obtain attribute locations. 
        this.aPosition = gl.getAttribLocation(this.program, "aPosition");     
        this.aNormal = gl.getAttribLocation(this.program, "aNormal"); 
        this.aColor = gl.getAttribLocation(this.program, "aColor"); 
        
        this.aUV = gl.getAttribLocation(this.program, "aUV"); 
        this.aInstanceWorldMatrix = gl.getAttribLocation(this.program, "aInstanceWorldMatrix");  
        // Determine uniform locations.
        this.uViewProjectionMatrix = gl.getUniformLocation(this.program, "uViewProjectionMatrix");

        this.uTextureSampler = gl.getUniformLocation(this.program, 'uTextureSampler');
        this.uTintColor = gl.getUniformLocation(this.program, 'uTintColor');
        
        //gl.uniform3f(this.uTintColor, 1.0, 0.25, 0.25);
   }

   matrixAttribPointer(loc, instance) {
       var mat = flatten(transpose( instance));
        gl.vertexAttribPointer(loc  , 4, gl.FLOAT, false, 64, 0);
        gl.vertexAttribPointer(loc+1, 4, gl.FLOAT, false, 64, 16);
        gl.vertexAttribPointer(loc+2, 4, gl.FLOAT, false, 64, 32);
        gl.vertexAttribPointer(loc+3, 4, gl.FLOAT, false, 64, 48);

        gl.vertexAttrib4f(loc, mat[0], mat[1], mat[2], mat[3] );
        gl.vertexAttrib4f(loc+1, mat[4], mat[5], mat[6], mat[7] );
        gl.vertexAttrib4f(loc+2, mat[8], mat[9], mat[10], mat[11] );
        gl.vertexAttrib4f(loc+3, mat[12], mat[13], mat[14], mat[15] );
   }


 
}
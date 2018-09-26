"use strict";
/**
 * Represents a compiled shader and contains references to attributes and uniform values.
 * 
 * @author  Lecks Chester
 */
class Shader { 
    /**
     * Compiles the shader and finds the locations of its attributes and uniform values.
     * 
     * It does not matter if not all of the locations exist.
     * 
     * @param {WebGLContext}    gl                  The WebGL Context. 
     * @param {string}          vertexShaderCode    The code making up the vertex shader.
     * @param {string}          fragmentShaderCode  The code making up the fragment shader.
     */
    constructor(gl, vertexShaderCode, fragmentShaderCode) {
        // Load shader.
        this.program = initShaders(gl, vertexShaderCode, fragmentShaderCode); 
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
        this.uIsSelected = gl.getUniformLocation(this.program, 'uIsSelected');
        this.uTime = gl.getUniformLocation(this.program, 'uTime');
   }


   /**
    * Sets up a matrix attribute to receive a single value (and sets that value).
    * 
    * @param {WebGLContext} gl         The WebGL context.
    * @param {number}       loc        The location of the start of the matrix attribute.
    * @param {matrix}       instance   The instance to upload to the attribute.
    */
   matrixAttribPointer(gl, loc, instance) {
       var mat = flatten(transpose( instance));
        gl.vertexAttribPointer(loc  , 4, gl.FLOAT, false, 64, 0);
        gl.vertexAttribPointer(loc+1, 4, gl.FLOAT, false, 64, 16);
        gl.vertexAttribPointer(loc+2, 4, gl.FLOAT, false, 64, 32);
        gl.vertexAttribPointer(loc+3, 4, gl.FLOAT, false, 64, 48);

        gl.vertexAttrib4f(loc, mat[0], mat[4], mat[8], mat[12] );
        gl.vertexAttrib4f(loc+1, mat[1], mat[5], mat[9], mat[13] );
        gl.vertexAttrib4f(loc+2, mat[2], mat[6], mat[10], mat[14] );
        gl.vertexAttrib4f(loc+3, mat[3], mat[7], mat[11], mat[15] );

        gl.disableVertexAttribArray(loc);
        gl.disableVertexAttribArray(loc+1);
        gl.disableVertexAttribArray(loc+2);
        gl.disableVertexAttribArray(loc+3);
   }


    /**
    * Sets up a matrix attribute to receive an array.
    * 
    * @param {WebGLContext} gl         The WebGL context.
    * @param {number}       loc        The location of the start of the matrix attribute.
    */
   matrixAttribPointerInstanced(gl, loc) {
        gl.vertexAttribPointer(loc  , 4, gl.FLOAT, false, 64, 0);
        gl.vertexAttribPointer(loc+1, 4, gl.FLOAT, false, 64, 16);
        gl.vertexAttribPointer(loc+2, 4, gl.FLOAT, false, 64, 32);
        gl.vertexAttribPointer(loc+3, 4, gl.FLOAT, false, 64, 48);

        
        gl.ANGLE_instanced_arrays.vertexAttribDivisorANGLE(loc, 1);
        gl.ANGLE_instanced_arrays.vertexAttribDivisorANGLE(loc+1, 1);
        gl.ANGLE_instanced_arrays.vertexAttribDivisorANGLE(loc+2, 1);
        gl.ANGLE_instanced_arrays.vertexAttribDivisorANGLE(loc+3, 1);

        gl.enableVertexAttribArray(loc);
        gl.enableVertexAttribArray(loc+1);
        gl.enableVertexAttribArray(loc+2);
        gl.enableVertexAttribArray(loc+3);
    }
}
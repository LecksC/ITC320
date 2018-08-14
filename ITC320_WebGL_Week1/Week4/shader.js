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
        this.uMaskSampler = gl.getUniformLocation(this.program, 'uMaskSampler');
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

   //based on https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
   setTextureMap(url, sampler) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  width, height, border, srcFormat, srcType,
                  pixel);
  
    const image = new Image();
    image.onload = function() {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    srcFormat, srcType, image);
  
      // WebGL1 has different requirements for power of 2 images
      // vs non power of 2 images so check if the image is a
      // power of 2 in both dimensions.
      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
         // Yes, it's a power of 2. Generate mips.
         gl.generateMipmap(gl.TEXTURE_2D);
      } else {
         // No, it's not a power of 2. Turn of mips and set
         // wrapping to clamp to edge
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
      gl.getUniformLocation();
    };
    image.src = url;
  
    return texture;
   }

 
}
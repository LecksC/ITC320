"use strict";
/**
 * Class to handle a mesh and contain its shader, buffers, and mesh data.
 * 
 * @author: Lecks Chester
 */
class MeshPart {
    /**
     * Initializes a mesh part.
     * 
     * @param {Shader}  shader   the shader to use to draw the mesh.
     */
    constructor(name, offset, vertcount) {
        this.name = name;
        this.mainTexture = null;
        this.offset = offset;
        this.count = vertcount;
        this.shader = new Shader(vertexShaderGLSL, fragmentShaderGLSL);
        
    }
}



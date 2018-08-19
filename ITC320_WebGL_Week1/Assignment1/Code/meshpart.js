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
     * @param {WebGLContext}    gl          The WebGL Context.
     * @param {string}          name        The name of the mesh part (or material).
     * @param {integer}         offset      The offset of the first index in the mesh part.
     * @param {integer}         vertcount   The number of vertices in the mesh part.
     */
    constructor(gl, name, offset, vertcount) {
        this.name = name;
        this.mainTexture = null;
        this.offset = offset;
        this.count = vertcount;
        this.shader = new Shader(gl, Game.GLSL.vsStandard, Game.GLSL.fsTextured);
    }
}



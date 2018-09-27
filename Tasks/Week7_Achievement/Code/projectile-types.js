"use strict";
/**
 * Class to represent a type of projectile.
 * 
 */
class ProjectileType {
    /**
     * Constructs a projectile type, with its' mesh, speed and weight.
     * 
     * @param {Mesh}    mesh        The mesh to use for the projectile.
     * @param {float}   startSpeed  The starting speed of the projectile.
     * @param {float}   weight      The weight of the projectile.
     */
    constructor(mesh, startSpeed, weight)
    {
        this.mesh = mesh;
        this.startSpeed = startSpeed;
        this.weight = weight;
    }

    /**
     * Draws all instances of the projectile.
     * 
     * @param {WebGLContext}    gl      The WebGL Context.
     * @param {Camera}          camera  The camera to use to draw the meshes.
     */
    draw(gl, camera)
    {
        this.mesh.draw(gl, camera);
    }
}
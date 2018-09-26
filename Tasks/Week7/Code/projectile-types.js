class ProjectileType {
    /**
     * Constructs a car, loads its' content and sets its' default properties.
     * 
     * @param {WebGLContext}    gl  The WebGL Context.
     */
    constructor(mesh, startSpeed, weight)
    {
        this.mesh = mesh;
        this.startSpeed = startSpeed;
        this.weight = weight;
    }

    /**
     * Draw all of the car meshes. Should only be called once per frame (not once per vehicle).
     * 
     * @param {WebGLContext}    gl      The WebGL Context.
     * @param {Camera}          camera  The camera to use to draw the meshes.
     * @param {float}           time    The current time used to colour the car.
     */
    draw(gl, camera, time)
    {
        this.mesh.draw(gl, camera, time);
    }
}
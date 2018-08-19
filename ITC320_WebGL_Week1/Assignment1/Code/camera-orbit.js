"use strict";
/**
 * Class that represents a camera, handles its movement/rotation, and generates its matrices.
 * 
 * @author  Lecks Chester
 */
class OrbitCamera {
    /**
     * Initializes the camera and sets default values.
     * 
     */
    constructor() {
        this.name = "Orbit Camera";
        this.instructions = "Click and drag to look around.";
        // The height above the ground.
        this.distance = 10;
        this.height = 4;
        // The initial position and rotation.
        this.eye = vec3(0, 0, 0);
        this.at = vec3(1, 0, 0);
        this.target = null;
        this.rotationX = 0;
        this.rotationY = 0;
        // The limits for looking up/down.
        this.minRotationY = -70;
        this.maxRotationY = 70;
        // Projection settings.
        this.near = 0.5;
        this.far = 1000;
        this.fieldOfViewY = 70;
        this.aspect = 1;
        // variables to store the matrices in.
        this.projection = null;
        this.view = null;
        this.viewProjection = null;
    }


    /**
     * Update the view, projection and viewProjection matrices.
     * 
     */
    updateMatrices() {
        this.projection = perspective(this.fieldOfViewY, this.aspect, this.near, this.far);
        const up = vec3(0, 1, 0);
        this.view = lookAt(this.eye, this.at, up);
        this.viewProjection = mult(this.projection, this.view);
    }


    /**
     * Runs every frame to perform any time-based updates on the camera.
     * 
     * @param   {float} deltaTime   the time since the last update in seconds.
     */
    update(deltaTime) {
        if(this.target === null)
            return;
        // Move the camera to the new target position.
        this.at = this.target.position; 
        this.eye = add(this.target.position, rotateAroundAxis(vec3(-this.distance, this.height, 0), vec3(0, 1, 0), this.rotationX));
    }


    /**
     * Does nothing on this camera.
     * 
     * @param   {float} forward     the distance to move forward (negative for backwards).
     * @param   {float} right   the distance to move right (negative for left).
     */
    move(forward, right) {

    }

    /**
     * Rotates the camera the specified number of degrees left/right. Up/down is ignored on this camera.
     * 
     * @param {float} right     the number of degrees to rotate the camera right (negative for left).
     * @param {float} up        the number of degrees to rotate the camera up (negative for down).
     */
    look(right, up) {
        this.rotationX += right;
        while (this.rotationX < -180) {
            this.rotationX += 360;
        }
        while (this.rotationX > 180) {
            this.rotationX -= 360;
        }
        this.rotationY += up;
        this.rotationY = Math.max(this.minRotationY, Math.min(this.maxRotationY, this.rotationY));
    }

    
    /**
     * Gets the forward vector for the camra
     * 
     * @returns {vec3}  the forward vector for the camera based on its rotation.
     */
    get forwardVector() {
        var fwd = vec3(0, 0, 1);
        fwd = rotateAroundAxis(fwd, vec3(1, 0, 0), this.rotationY);
        fwd = rotateAroundAxis(fwd, vec3(0, 1, 0), this.rotationX);
        return fwd;
    }
}

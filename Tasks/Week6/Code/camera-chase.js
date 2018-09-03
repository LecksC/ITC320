"use strict";
/**
 * Class that represents a camera, handles its movement/rotation, and generates its matrices.
 * 
 * @author  Lecks Chester
 */
class ChaseCamera {
    /**
     * Initializes the camera and sets default values.
     * 
     */
    constructor() {
        // The name of the camera.
        this.name = "Chase Camera";

        // Instructions to display on the screen when this camera is active.
        this.instructions = "";

        //The horizontal distance from the target.
        this.distance = 5.0;

        // The height above the ground.
        this.height = 2.5;

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
        // Move the camera behind the target.
        if(this.target === null)
            return;
        this.at = this.target.position; 
        let behind = subtract(this.target.position, scale(this.distance, this.target.forwards));
        behind[1] = this.height;
        this.eye = behind;
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
     * Does nothing on this camera.
     * 
     * @param {float} right     the number of degrees to rotate the camera right (negative for left).
     * @param {float} up        the number of degrees to rotate the camera up (negative for down).
     */
    look(right, up) {

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

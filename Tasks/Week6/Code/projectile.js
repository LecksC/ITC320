"use strict";
/**
 * Class to load, store, update and draw a car's properties and graphics content.
 * 
 * @author Lecks Chester
 */
class Projectile {
    /**
     * Constructs a car, loads its' content and sets its' default properties.
     * 
     * @param {vec3}              position      The starting position of the projectile.
     * @param {vec3}              direction     The direction the projectile was fired.     
     * @param {ProjectileType}    type          The type of projectile to spawn.
     */
    constructor(position, direction, type)
    {
        /**
         * The current position of the car.
         * 
         * @type {vec3}
         */
        this.position = position;

        /**
         * The current forward vector of the bullet.
         * 
         * @type {vec3}
         */
        this.forwards = direction;

        /**
         * The target forward vector of the car.
         * 
         * @type {vec3}
         */
        this.velocity = scale(type.startSpeed, direction);

        this.type = type;
    }


    /**
     * Updates the vehicle, handling "AI", movement and physics.
     * 
     * @param {float}   deltaTime   the time since the previous update.
     */
    update(deltaTime)
    {
        this.position = add(this.position, scale(deltaTime, this.velocity));
        this.type.mesh.addInstanceFromVectors(this.position, eulerFromUnitVector(this.forwards), vec3(1.0,1.0,1.0));
    }


}
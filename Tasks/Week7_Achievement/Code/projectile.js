"use strict";
/**
 * Class to handle an instance of a projectile.
 * 
 * @author Lecks Chester
 */
class Projectile {
    /**
     * Constructs a projectile and sets its initial properties.
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
         * The current velocity of the bullet.
         * 
         * @type {vec3}
         */
        this.velocity = scale(type.startSpeed, direction);

        this.type = type;

        this.enabled = true;
    }


    /**
     * Updates the projectile and handles any of its' collisions.
     * 
     * @param {float}   deltaTime   The time since the previous update.
     * @param {Physics} physics     The physics engine.
     */
    update(deltaTime, physics)
    {
        if(this.enabled) {
            this.velocity[1] -= this.type.weight*deltaTime;

            let travelDistance = deltaTime;
            let intersect = physics.rayCast(this.position, normalized(this.velocity), magnitude(this.velocity) * travelDistance);
            let dest = [];
            if(intersect === null)
            {
                dest = add(this.position, scale(travelDistance, this.velocity));
            }
            else {
                this.velocity = vec3(0,this.velocity[1], 0);
                dest = intersect.position;
                physics.destroyInstance(intersect.mesh, intersect.instance);
                console.log("INTERSECTED - projectile stopped");
            }
            if(dest[0] < -40 || dest[0] > 40 || dest[1] < -40 || dest[1] > 40 || dest[2] < -40 || dest[2] > 40)
                this.velocity = vec3(0,this.velocity[1], 0);
            if(dest[1] < 0.01)
            {
                this.velocity[1] = 0;
                
                this.enabled = false;
            }
            if(magnitude(this.velocity) < 0.03 && this.position[0] < .001)
            {
                this.enabled = false;
            }
            if(this.enabled)
            {
                
                this.forwards = normalized(this.velocity);
            }
            this.position = dest;
        }

        this.type.mesh.addInstanceFromVectors(this.position, eulerFromUnitVector(this.forwards), vec3(1.0,1.0,1.0));
    }
}
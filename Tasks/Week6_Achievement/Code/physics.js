"use strict";
/**
 * Class to initialize, store data for, and run the main loop for the application.
 * 
 */
class Physics {
    /**
     * Initializes the physics "engine".
     * 
     */
    constructor(game) {
        this.game = game;
    }

    rayCast(rayPoint, rayDirection, rayLength)
    {
        let intersection = null;
        let closestDistance = rayLength;
        let instance = 0;
        for(let i = 0; i < this.game.meshes.length; i++)
        {
            let intersect = this.game.meshes[i].rayCast(rayPoint, rayDirection, rayLength);
            if(intersect !== null)
            {
                let distance = magnitude(subtract(intersect.position, rayPoint));
              //  if(distance <= closestDistance)
              //  {
                    intersection = { position: intersect.position, instance: intersect.instance, mesh: i };
                    closestDistance = distance;
               // }
            }
        }
        return intersection;
    }

    destroyInstance(meshIndex, instanceIndex)
    {
        if(this.game.meshes[meshIndex].destructable)
        {
            this.game.meshes[meshIndex].instances.splice(instanceIndex, 1);
            this.game.meshes[meshIndex].instancesUpdated = false;
        }
    }
}
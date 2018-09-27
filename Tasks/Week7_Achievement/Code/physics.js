"use strict";
/**
 * Class to encapsulate any physics logic for the program.
 * 
 */
class Physics {
    /**
     * Initializes the physics "engine".
     * 
     * @param {Game}    game   The game that the physics is attached to.
     */
    constructor(game) {
        this.game = game;
    }


    /**
     * Tests a line against all static meshes defined in the game.
     * 
     * @param {vec3}    rayPoint        The start point of the ray to test.
     * @param {vec3}    rayDirection    The direction of the ray.
     * @param {float}   rayLength       The length of the ray.
     * 
     * @returns {{position:vec3, instance:int, mesh:int}} The intersection including the position, 
     *                                                    instance index and mesh index.
     */
    rayCast(rayPoint, rayDirection, rayLength)
    {
        let intersection = null;
        let closestDistance = rayLength;
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


    /**
     * Deletes an instance of a mesh from the scene if it's destructable.
     * 
     * @param {int} meshIndex The index of the mesh.
     * @param {int} instanceIndex The index of the mesh instance.
     */
    destroyInstance(meshIndex, instanceIndex)
    {
        if(this.game.meshes[meshIndex].destructable)
        {
            this.game.meshes[meshIndex].instances.splice(instanceIndex, 1);
            this.game.meshes[meshIndex].instancesUpdated = false;
        }
    }
}
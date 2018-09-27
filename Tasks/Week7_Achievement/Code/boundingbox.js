"use strict";
/**
 * Represents an axis aligned bounding box.
 * 
 */
class BoundingBox {
   
    /**
     * Constructs the bounding box and gets it ready for the first point to be added.
     */
    constructor()
    {
        this.min = null;
        this.max = null;
    }


    /**
     * Adds a position to the bounding box, expanding the box's min/max to accommodate it.
     * 
     * @param {vec3}    point   The position to add.
     */
    addPoint(point) {
        if(this.min === null)
        {
            this.min = vec3(point[0], point[1], point[2]);
            this.max = vec3(point[0], point[1], point[2]);
            return;
        }

        this.min = componentMin(this.min, point);
        this.max = componentMax(this.max, point);
    }


    /**
     * Calculates and returns the center of the bounding box.
     * 
     * @returns {vec3}  The center of the bounding box.
     */
    get center() {
        if(this.min === null)
            return [0,0,0];
        return [(this.min[0] + this.max[0])*0.5, (this.min[1] + this.max[1])*0.5, (this.min[2] + this.max[2])*0.5];
    }

    
    /**
     * Calculates and returns the size of the bounding box.
     * 
     * @returns {vec3}  The size of the bounding box.
     */
    get size() {
        if(this.min ===  null)
            return [0,0,0];
        return subtract(this.max, this.min);
    }
}
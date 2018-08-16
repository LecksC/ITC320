class BoundingBox {
    
    constructor()
    {
        this.min = null;
        this.max = null;
    }

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

    get center() {
        if(this.min === null)
            return [0,0,0];
        return [(this.min[0] + this.max[0])*0.5, (this.min[1] + this.max[1])*0.5, (this.min[2] + this.max[2])*0.5];
    }

    get size() {
        if(this.min ===  null)
            return [0,0,0];
        return subtract(this.max, this.min);
    }
}
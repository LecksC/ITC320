"use strict";
/**
 * Class to load, store, update and draw a car's properties and graphics content.
 * 
 * @author Lecks Chester
 */
class Car {
    /**
     * Constructs a car, loads its' content and sets its' default properties.
     * 
     * @param {WebGLContext}    gl  The WebGL Context.
     */
    constructor(gl)
    {
        /**
         * The size of the area the car should drive around.
         * 
         * @type {vec3}
         */
        this.areaSize = vec3(60, 0,30);

        /**
         * The current position of the car.
         * 
         * @type {vec3}
         */
        this.position = vec3(0,0,0);

        /**
         * The current forward vector of the car.
         * 
         * @type {vec3}
         */
        this.forwards = vec3(1,0,0);

        /**
         * The target forward vector of the car.
         * 
         * @type {vec3}
         */
        this.targetDir = vec3(1,0,0);

        /**
         * The current speed of the car.
         * 
         * @type {float}
         */
        this.speed = 30.0;

        /**
         * The speed that the car turns.
         * 
         * @type {float}
         */
        this.turnspeed = 2.0;  

        /**
         * The tilt of the vehicle left/right. Used to "simulate" suspension while turning.
         * Ranges from -PI/4 to PI/4.
         * 
         * @type {float}
         */
        this.tilt = 0;  

        /**
         * The velocity of the tilt of the vehicle.
         * 
         * @type {float}
         */
        this.tiltVelocity = 0;  

        /**
         * The k value (spring strength) for the tilt for the vehicle.
         * 
         * @type {float}
         */
        this.tiltSpringK = 170;

        /**
         * The spring damping value for the tilt for the vehicle.
         * 
         * @type {float}
         */
        this.tiltSpringDamping = 5.25;

        /**
         * The mass used for the tilt spring simulation.
         * 
         * @type {float}
         */
        this.tiltSpringMass = 10;  

        /**
         * The the amount turning adds to the tilt velocity.
         * 
         * @type {float}
         */
        this.tiltStrength = 2.5;
        /**
         * The maximum radians the vehicle can be tilting in either direction.
         * 
         * @type {float}
         */
        this.tiltLimit = Math.PI/16;

        /**
         * The amount that the vehicle is currently sliding/drifting.
         * Clamped between -PI and PI.
         * 
         * @type {float}
         */
        this.slide = 0;  

        /**
         * The velocity of the slide of the vehicle.
         * 
         * @type {float}
         */
        this.slideVelocity = 0;     

        /**
         * The k value (spring strength) for the slide for the vehicle.
         * 
         * @type {float}
         */
        this.slideSpringK = 270;

        /**
         * The spring damping value for the slide for the vehicle.
         * 
         * @type {float}
         */
        this.slideSpringDamping = 15.25;

        /**
         * The mass used for the slide spring simulation.
         * 
         * @type {float}
         */
        this.slideSpringMass = 10;

        /**
         * The the amount turning adds to the slide velocity.
         * 
         * @type {float}
         */
        this.slideStrength = 20;

        /**
         * The maximum radians the vehicle can be sliding out in either direction.
         * 
         * @type {float}
         */
        this.slideLimit = Math.PI/4;


        /**
         * The amount to scale the entire car model.
         * 
         * @type {float}
         */
        this.scale = 10.0;
        // Start loading the content for the car.


        this.loadContent(gl);
    }


    /**
     * Loads the mesh and texture content, and then separates the wheels and brakes 
     * into separate meshes.
     * 
     * @param {WebGLContext}    gl  The WebGL Context.
     */
    loadContent(gl)
    {
        const allMovingParts = [
            32, //front left brake
            16, // front right brake
            8, // back right brake
            24, // back left brake
            33,34,35,36,37,39, // front left wheel + nuts
            17,18,19,20,21,23, // front right wheel + nuts
            25,26,27,28,29,31, // back left wheel + nuts
             9,10,11,12,13,15]; // back right wheel + nuts
        const allPaintedPartsFromRemainder = [
            0,1,2,3,4,5,6,7,8,9,10,11,12,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
            33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,
            57,59,63,64];
        let self = this;
        this.mesh = new Mesh(gl);
        this.flBrakeMesh = new Mesh(gl);
        this.frBrakeMesh = new Mesh(gl);
        this.blBrakeMesh = new Mesh(gl);
        this.brBrakeMesh = new Mesh(gl);
        this.flWheelMesh = new Mesh(gl);
        this.frWheelMesh = new Mesh(gl);
        this.blWheelMesh = new Mesh(gl);
        this.brWheelMesh = new Mesh(gl);

        // Download the main mesh and, in the callback for when it's done, separate the wheel
        // meshes.
        this.mesh.downloadObj(gl, "car", function(mesh) {
            self.mesh.updateBuffers(gl);

            // Create a mesh that references all of the data from the main mesh, 
            // but only has mesh parts for the parts of the wheels.
            self.flBrakeMesh.createMeshFromParts(self.mesh, [32]);
            self.frBrakeMesh.createMeshFromParts(self.mesh, [16]);
            self.blBrakeMesh.createMeshFromParts(self.mesh, [24]);
            self.brBrakeMesh.createMeshFromParts(self.mesh, [8]);
            self.flWheelMesh.createMeshFromParts(self.mesh, [33,34,35,36,37,39]);
            self.frWheelMesh.createMeshFromParts(self.mesh, [17,18,19,20,21, 23]);
            self.blWheelMesh.createMeshFromParts(self.mesh, [25,26,27,28,29, 31]);
            self.brWheelMesh.createMeshFromParts(self.mesh, [9,10,11,12,13, 15]);

            // Create a variable on each wheel to store it's current rotation. 
            // I could probably just use 1 variable for this non-realistic simulation, 
            // but thought it might be useful if it became more realistic.
            self.flBrakeMesh.rotation = 0;
            self.frBrakeMesh.rotation = 0;
            self.blBrakeMesh.rotation = 0;
            self.brBrakeMesh.rotation = 0;
            self.flWheelMesh.rotation = 0;
            self.frWheelMesh.rotation = 0;
            self.blWheelMesh.rotation = 0;
            self.brWheelMesh.rotation = 0;
            let newParts = [];

            // Remove all of the moving parts from the main mesh.
            for(let i = 0; i < self.mesh.meshParts.length; i++)
            {
                let part = self.mesh.meshParts[i];
                if(allMovingParts.indexOf(i) === -1)
                {
                    newParts.push(part);
                }
            }
            self.mesh.meshParts = newParts;
            for(let i = 0; i < self.mesh.meshParts.length; i++)
            {
                let part = self.mesh.meshParts[i];
                if(allPaintedPartsFromRemainder.indexOf(i) >= 0)
                    part.shader = new Shader(gl, Game.GLSL.vsStandard, Game.GLSL.fsCarPaint);
                // This was used for working out which part was which.
               //let check = document.createElement('input');
               //check.setAttribute("type", "checkbox");
               //document.getElementsByTagName('body')[0].appendChild(check);
               //var span = document.createElement('span');
               //span.innerHTML = i;
               //document.getElementsByTagName('body')[0].appendChild(span);

               //check.onchange = function() { 
               //    gl.useProgram(self.mesh.meshParts[i].shader.program);
               //    gl.uniform1f(self.mesh.meshParts[i].shader.uIsSelected, check.checked ? 1.0 : 0.0);
               //};
            }
            });
    }


    /**
     * Clear instances from all meshes so they can be re-added at their new positions.
     * 
     */
    resetInstances()
    {
        this.mesh.instances = [];
        this.flBrakeMesh.instances = [];
        this.frBrakeMesh.instances = [];
        this.flWheelMesh.instances = [];
        this.frWheelMesh.instances = [];
        this.blWheelMesh.instances = [];
        this.brWheelMesh.instances = [];
        this.blBrakeMesh.instances = [];
        this.brBrakeMesh.instances = [];
    }


    /**
     * Updates the vehicle, handling "AI", movement and physics.
     * 
     * @param {float}   deltaTime   the time since the previous update.
     */
    update(deltaTime)
    {
        // Handle changes in direction when the car hits one of the edges of the area. 
        // Which edge depends on their current target direction.
        if(this.targetDir[0] === -1 && this.position[0] < -this.areaSize[0])
        {
            this.targetDir = vec3(0,0,1);
        }
        if(this.targetDir[0] === 1 && this.position[0] > this.areaSize[0])
        {
            this.targetDir = vec3(0,0,-1);
        }
        if(this.targetDir[2] === -1 && this.position[2] < -this.areaSize[2])
        {
            this.targetDir = vec3(-1,0,0);
        }
        if(this.targetDir[2] === 1 && this.position[2] > this.areaSize[2])
        {
            this.targetDir = vec3(1,0,0);
        }

        // Record the old forward direction, calculate the new one (moving towards the target direction),
        // and work out the angle between the 2.
        let oldforwards = vec3(this.forwards[0], this.forwards[1], this.forwards[2]);
        this.forwards = normalize(mix(this.forwards, this.targetDir, deltaTime*this.turnspeed));
        var anglechange = angleBetween(vec3(0,0,0), oldforwards, this.forwards);

        // Use a spring algorithm (https://www.khanacademy.org/partner-content/pixar/simulation/hair-simulation-code/p/step-3-damped-spring-mass-system)
        // to calculate the tilt left/right of the vehicle. Accumulates tilt while turning.
        this.tiltVelocity += anglechange*this.tiltStrength;
        let springForceY = -this.tiltSpringK*(this.tilt);
        let dampingForceY = this.tiltSpringDamping * this.tiltVelocity;
        let forceY = springForceY - dampingForceY;
        let accelerationY = forceY/this.tiltSpringMass;
        this.tiltVelocity = this.tiltVelocity + accelerationY * deltaTime;
        this.tilt = this.tilt + this.tiltVelocity * deltaTime;
        this.tilt = Math.min(this.tiltLimit, Math.max(this.tilt, -this.tiltLimit));

        // Use a spring algorithm to calculate how much the vehicle is sliding (how much the back end is 'kicked out'). Accumulates while turning.
        this.slideVelocity += anglechange*this.slideStrength;
        springForceY = -this.slideSpringK*(this.slide);
        dampingForceY = this.slideSpringDamping * this.slideVelocity;
        forceY = springForceY - dampingForceY;
        accelerationY = forceY/this.slideSpringMass;
        this.slideVelocity = this.slideVelocity + accelerationY * deltaTime;
        this.slide = this.slide + this.slideVelocity * deltaTime;
        this.slide = Math.min(this.slideLimit, Math.max(this.slide, -this.slideLimit));

        // Update the position of the vehicle.
        this.position = add(this.position, scale(this.speed * deltaTime, this.forwards));

        // Create the base transformation for wheels/brakes, and the transformation for the body (which just has the tilt added).
        // I'm not quite sure why the forward Z value has to be flipped here, but it does.
        let mainRotation = lookAt(vec3(0,0,0), vec3(this.forwards[0], 0, -this.forwards[2]), vec3(0,1,0)); 
        let slideRotation = rotate(this.slide*RADIANS_TO_DEGREES, vec3(0,1,0));
        let tiltRotation = rotate(this.tilt*RADIANS_TO_DEGREES, vec3(0,0,1));
        let yOffset = 0;
        if(this.blWheelMesh.bounds.min !== null)
        {
            yOffset = this.blWheelMesh.bounds.min[1];
        }
        let translateToCenter =mult(scalem([this.scale, this.scale, this.scale]), translate(scale(-1,vec3(this.mesh.bounds.center[0],yOffset,this.mesh.bounds.center[2]))));
        let baseMatrix = mult(translate(this.position), mult(mainRotation, mult(slideRotation, translateToCenter)));
        let bodyMatrix = mult(translate(this.position), mult(mainRotation, mult(mult(slideRotation, tiltRotation ),translateToCenter)));
        this.mesh.addInstance(bodyMatrix);

        // Calculate the turn angle by determing the difference between the current and target directions, accounting for 
        // the amount the car is sliding/drifting. 
        let turnangle = angleBetween(vec3(0,0,0), this.forwards, this.targetDir) - this.slide;
        turnangle = Math.min(Math.PI, Math.max(turnangle, -Math.PI));

        // Update the wheels/brakes. Brakes don't rotate and rear wheels/brakes don't turn.
        this.updateWheel(this.flBrakeMesh, 0, baseMatrix,turnangle);
        this.updateWheel(this.frBrakeMesh, 0, baseMatrix,turnangle);
        this.updateWheel(this.blBrakeMesh, 0, baseMatrix,0);
        this.updateWheel(this.brBrakeMesh, 0, baseMatrix,0);
        this.updateWheel(this.flWheelMesh, deltaTime, baseMatrix,turnangle);
        this.updateWheel(this.frWheelMesh, deltaTime, baseMatrix,turnangle);
        this.updateWheel(this.blWheelMesh, deltaTime, baseMatrix,0);
        this.updateWheel(this.brWheelMesh, deltaTime, baseMatrix,0);
    }


    /**
     * Updates the wheel rotation and turn angle relative to the car, and adds wheel world matrix instance.
     * 
     * @param {Mesh}    wheel           The wheel to update.
     * @param {float}   deltaTime       The time passed since the last update (used to rotate the wheel, use 0 for brakes).
     * @param {matrix}    baseMatrix      The transform matrix for the base of the car (including slide, excluding tilt).
     * @param {float}   turnAngle       The clamped angle that the wheel is turning relative to the car.
     */
    updateWheel(wheel, deltaTime, baseMatrix, turnAngle)
    {
        wheel.rotation += deltaTime*500*this.speed;
        let rotation = mult(rotate(turnAngle*RADIANS_TO_DEGREES, [0,1,0]), rotate(wheel.rotation, [1,0,0]));
        // Translate the center of the wheel to the origin, rotate, then translate back.
        wheel.addInstance(mult(baseMatrix,mult(translate(wheel.bounds.center), mult(rotation, translate(scale(-1,wheel.bounds.center))))));
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
        this.flBrakeMesh.draw(gl, camera);
        this.frBrakeMesh.draw(gl, camera);
        this.flWheelMesh.draw(gl, camera);
        this.frWheelMesh.draw(gl, camera);
        this.blWheelMesh.draw(gl, camera);
        this.brWheelMesh.draw(gl, camera);
        this.blBrakeMesh.draw(gl, camera);
        this.brBrakeMesh.draw(gl, camera);
    }
}
"use strict";
/**
 * Global variable to hold a reference the instance of the application.
 * 
 * @type {Game}
 */
var game;
/**
 * Class to initialize, store data for, and run the main loop for the application.
 * 
 */
class Game {
    /**
     * Initializes the application.
     * 
     */
    constructor() {
        /**
         * The canvas to draw the WebGL output to.
         * 
         * @type {CanvasDOMElement}     
         */
        this.canvas;

        /**
         * The WebGL Context.
         * 
         * @type {WebGLContext}
         */
        this.gl;

        /**
         * The index of the current camera.
         * 
         * @type {integer}
         */
        this.cameraIndex = 0;

        /**
         * References to all of the cameras.
         * 
         * @type {Camera[]}
         */
        this.cameras = [];

        /**
         * The Car.
         * 
         * @type {Car}
         */
        this.car;

        /**
         * The first building mesh.
         * 
         * @type {Mesh}
         */
        this.h1;

        /**
         * The second building mesh.
         * 
         * @type {Mesh}
         */

        this.h2;
        /**
         * The third building mesh.
         * 
         * @type {Mesh}
         */
        this.h3;

        /**
         * The floor mesh.
         * 
         * @type {Mesh}
         */
        this.floor;

        /**
         * The number of layers of buildings. More is slower (adds rows of buildings on 3 sides).
         * 
         * @type {integer}
         */
        this.buildingLayers = 10;

        /**
         * Values used to keep track of time and statistics.
         *
        * @type     {float}
        */
        this.timing = {
            deltaTime: 0,
            currentTime: 0,
            previousFrameTime: 0,
            elapsedTime: 0,
            frameCount: 0,
            polyCount: 0,
            drawCallCount: 0
        };


        /**
         * Values used to track input.
         *
         * @type     {boolean}
         * @type     {vec3}
         */
        this.input = {
            forwardPressed: false,
            backPressed: false,
            leftPressed: false,
            rightPressed: false,
            mouseLookPressed: false,
            mouseLookStartPosition: null,
            mouseLookCurrentPosition: null
        };

        this.init();
    }


    /**
     * Initializes WebGL, the scene, and events.
     * 
     */
    init()
    {
        // Initialize WebGL.
        this.canvas = document.getElementById( "gl-canvas" );
        this.gl = WebGLUtils.setupWebGL( this.canvas );
        if ( !this.gl ) { alert( "WebGL isn't available" ); }
        this.gl.viewport( 0, 0,  this.canvas.width,  this.canvas.height );
        this.gl.clearColor( 0.0, 138/255, 255/255, 1.0 );
        this.gl.enable(this.gl.DEPTH_TEST);

        // Load the hardware instancing extension.
        this.gl.ANGLE_instanced_arrays = this.gl.getExtension("ANGLE_instanced_arrays");

        // Initialize the rest of the scene/page.
        this.initScene();
        this.initCameras();
        this.initEventHandlers();
        requestAnimationFrame(this.render.bind(this));
    }


    /**
     * Initializes cameras.
     * 
     */
    initCameras()
    {
        var orbit = new OrbitCamera();
        orbit.target = this.car;
        var chase = new ChaseCamera();
        chase.target = this.car;
        this.cameras.push(orbit);
        this.cameras.push(chase);
        this.cameras.push(new FirstPersonCamera());
        document.getElementById('instructions').innerHTML = this.cameras[this.cameraIndex].instructions;
    }


    /**
     * Initializes the scene (buildings, the ground and the car).
     * 
     */
    initScene()
    {
        let self = this;
        // Initialize car.
        this.car = new Car(this.gl);
        
        // Initialize buildings.
        this.h1 = new Mesh(this.gl);
        let h1scale = 0.3;
        let h2scale = 5.0;
        let h3scale = 25.0;

        //Create a couple of strips of 'H1' buildings.
        this.h1.downloadObj(this.gl, "H1", 
            function(mesh) {
                let height = -mesh.bounds.min[1];
                let center = mesh.bounds.center;
                let centeredMatrix = translate(-center[0], height, -center[2]);

                let spacingx = (mesh.bounds.size[0])*h1scale;
                let spacingz = (mesh.bounds.size[2])*h1scale;
                let countx = 19;
                let countz = 10;
                let x = -countx*spacingx*0.5;
                let z = -countz*spacingx*0.5;
                
                for(let xi = 0; xi <= countx; xi++)
                {
                    let scale =1.0 -0.1 * Math.random();
                    
                    let scaleMatrix = scalem([h1scale*scale,h1scale*scale,h1scale*scale]);
                    mesh.addInstance(mult(translate([x, 0, z]), mult(scaleMatrix, centeredMatrix)));

                //  mesh.addInstance(mult(translate([x, 0, -z]), mult(rotate(180, [0,1,0]), mult(scaleMatrix, centeredMatrix))));
                    x += spacingx;

                }
                x = -countx*spacingx*0.5 + center[2]-center[0];
                z += spacingz;
                for(let zi = 1; zi < countz; zi++)
                {
                    let scale =1.0 -0.1 * Math.random();
                    
                    let scaleMatrix = scalem([h1scale*scale,h1scale*scale,h1scale*scale]);
                    mesh.addInstance(mult(translate([x, 0, z]), mult(rotate(90, [0,1,0]) , mult(scaleMatrix, centeredMatrix))));

                    //mesh.addInstance(mult(translate([-x, 0, z]), mult(rotate(270, [0,1,0]), mult(scaleMatrix, centeredMatrix))));
                    z += spacingx;

                }
            }
        );

        
        // Create layers of 'H2' buildings covering 3 sides.
        this.h2 = new Mesh(this.gl);
        this.h2.downloadObj(this.gl, "H2", 
            function(mesh) {
                let height = -mesh.bounds.min[1];
                let center = mesh.bounds.center;
                let centeredMatrix = translate(-center[0], height, -center[2]);

                let spacingx = (mesh.bounds.size[0])*h2scale+ 1.0;
                let spacingz = (mesh.bounds.size[2])*h2scale+ 4.0;
                let countx = 14;
                let countz = 11;
                let x = -countx*spacingx*0.5;
                let z = -countz*spacingz*0.5;
                
                for(let t = 0; t < self.buildingLayers; t++)
                {
                    for(let xi = 0; xi <= countx; xi++)
                    {
                        let scale =1.0 -0.1 * Math.random();
                        
                        let scaleMatrix = scalem([h2scale*scale,h2scale*scale,h2scale*scale]);
                        mesh.addInstance(mult(translate([x, 0, z]), mult(scaleMatrix, centeredMatrix)));

                        mesh.addInstance(mult(translate([x, 0, -z]), mult(rotate(180, [0,1,0]), mult(scaleMatrix, centeredMatrix))));
                        x += spacingx;

                    }
                    x = -countx*spacingx*0.5 + center[2]-center[0];
                    z += spacingz;
                    for(let zi = 1; zi < countz; zi++)
                    {
                        let scale =1.0 -0.1 * Math.random();
                        
                        let scaleMatrix = scalem([h2scale*scale,h2scale*scale,h2scale*scale]);
                        mesh.addInstance(mult(translate([x, 0, z]), mult(rotate(90, [0,1,0]) , mult(scaleMatrix, centeredMatrix))));

                    // mesh.addInstance(mult(translate([-x, 0, z]), mult(rotate(270, [0,1,0]), mult(scaleMatrix, centeredMatrix))));
                        z += spacingz;

                    }
                    countx += 5 + Math.floor(Math.random()*3);
                    countz += 5 + Math.floor(Math.random()*3);
                    x = -countx*spacingx*0.5;
                    z = -countz*spacingz*0.5;
                }

            });
 
        // Create a couple of h3 buildings near the center, and a row of them at one end.
        this.h3 = new Mesh(this.gl);
        this.h3.downloadObj(this.gl, "H3", 
            function(mesh) {
                mesh.addInstance(mult(translate([-18, 0, 35]), scalem([h3scale,h3scale,h3scale])));
                mesh.addInstance(mult(translate([56, 0, 36]),  mult(rotate(270, [0,1,0]), scalem([h3scale,h3scale,h3scale]))));
                for(let i = 0; i < 5; i++)
                {
                    mesh.addInstance(mult(translate([110, 0, -50+i*20]),  mult(rotate(Math.floor(Math.random()*4)*90, [0,1,0]), scalem([h3scale,h3scale,h3scale]))));
                }
            });

        // Initialize floor.
        this.floor = new Mesh(this.gl);
        this.floor.downloadObj(this.gl, "floor", 
            function(mesh) {
                mesh.addInstance(mult(translate([0, 0, 0]), scalem([40,1,40])));
                mesh.meshParts[0].shader = new Shader(self.gl, Game.GLSL.vsStandard, Game.GLSL.fsGround);
            });
    }


    /**
     * Updates and renders the scene.
     * 
     * @param {float}   frameTime   The time since the applications started. Provided automatically by requestAnimationFrame.
     */
    render(frameTime)
    {
        this.gl.clear( this.gl.COLOR_BUFFER_BIT |this.gl.DEPTH_BUFFER_BIT );
        this.handleTiming(frameTime);
        this.handleInput();
        this.car.resetInstances();
        this.car.update(this.timing.deltaTime);
        let camera = this.cameras[this.cameraIndex];
        camera.update(this.timing.deltaTime);
        camera.updateMatrices();
        
        this.car.draw(this.gl, camera, this.timing.currentTime);
        this.h1.draw(this.gl, camera);
        this.h2.draw(this.gl, camera);
        this.h3.draw(this.gl, camera);
        this.floor.draw(this.gl, camera);
        requestAnimationFrame(this.render.bind(this));
    }

    /**
     * Handles timing (calculates new delta time) and statistics.
     * 
     * @param {float}   frameTime     The total time since the program started.
     */
    handleTiming(frameTime) {
        if(frameTime !== 0.0) {
            this.timing.deltaTime = (frameTime * 0.001) - this.timing.previousFrameTime;
            this.timing.currentTime += this.timing.deltaTime; 
            this.timing.previousFrameTime = frameTime * 0.001;
            this.timing.elapsedTime += this.timing.deltaTime;
            if(this.timing.elapsedTime >= 1) {
                var fps = this.timing.frameCount;
                this.timing.frameCount = 0;
                this.timing.elapsedTime -= 1;
                document.getElementById('fps').innerHTML = fps;
                document.getElementById('polyCount').innerHTML = this.timing.polyCount;
                document.getElementById('drawCallCount').innerHTML = this.timing.drawCallCount;
            }
        }
        this.timing.drawCallCount = 0;
        this.timing.polyCount = 0;
        this.timing.frameCount++;
    }


    /**
     * Sets up all of the event handlers required for the page.
     * 
     */
    initEventHandlers() {
        let self = this;
        window.onkeydown = function(event) {
            switch(event.key) {
                case "w":
                case "W": {
                    self.input.forwardPressed = true;
                    break;
                }
                case "s":
                case "S": {
                    self.input.backPressed = true;
                    break;
                }
                case "a":
                case "A": {
                    self.input.leftPressed = true;
                    break;
                }
                case "d":
                case "D": {
                    self.input.rightPressed = true;
                    break;
                }
            }
        };
        window.onkeyup = function(event) {
            switch(event.key) {
                case "w":
                case "W": {
                    self.input.forwardPressed = false;
                    break;
                }
                case "s":
                case "S": {
                    self.input.backPressed = false;
                    break;
                }
                case "a":
                case "A": {
                    self.input.leftPressed = false;
                    break;
                }
                case "d":
                case "D": {
                    self.input.rightPressed = false;
                    break;
                }
                case "c":
                case "C": {
                    self.cameraIndex = (self.cameraIndex+1)%self.cameras.length;
                    document.getElementById('instructions').innerHTML = self.cameras[self.cameraIndex].instructions;
                    self.onResizeCanvas();
                    break;
                }
            }
        };
        this.canvas.onmousedown = function(e) {
            self.input.mouseLookStartPosition = vec2(e.clientX, e.clientY);
            self.input.mouseLookPressed = true;
        };
        this.canvas.onmouseup =  function(e) {
            self.input.mouseLookPressed = false;
        };
        this.canvas.onmousemove = function(e) {
            self.input.mouseLookCurrentPosition = vec2(e.clientX, e.clientY);
        };
        window.oncontextmenu = function() { return false; };
        window.onresize = self.onResizeCanvas.bind(this);

        // Run onResizeCanvas to set up initial viewport.
        this.onResizeCanvas();
    }

    /**
     * Event to run when the canvas may have been resized. 
     * 
     * Updates the pixel size for the canvas/context and the aspect ratio for the camera.
     * 
     * Based on code from 
     * @link https://stackoverflow.com/questions/13870677/resize-viewport-canvas-according-to-browser-window-size
     */
    onResizeCanvas() {
        var width = this.canvas.clientWidth;
        var height = this.canvas.clientHeight;

        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height); 
        }
        
        this.cameras[this.cameraIndex].aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
    }



    /**
     * Updates the players position and look direction based on current input.
     *
     */
    handleInput() {
        var forward = 0;
        var right = 0;
        if(this.input.forwardPressed) {
            forward += 1;
        }
        if(this.input.backPressed) {
            forward -= 1;
        }
        if(this.input.rightPressed) {
            right += 1;
        }
        if(this.input.leftPressed) {
            right -= 1;
        }
        if(this.input.mouseLookPressed) {
            var lookDelta = subtract(this.input.mouseLookCurrentPosition, this.input.mouseLookStartPosition);
            this.cameras[this.cameraIndex].look(-lookDelta[0]*0.5,lookDelta[1]*0.5);
            this.input.mouseLookStartPosition = this.input.mouseLookCurrentPosition;
        }
        this.cameras[this.cameraIndex].move(forward*this.timing.deltaTime*10,right*this.timing.deltaTime*10);
    }
}
/**
 * An object to store GLSL script source in.
 * 
 */
Game.GLSL = {};

/**
 * Start the application once scripts have loaded.
 * 
 */
window.onload = function() {
    game = new Game();
};
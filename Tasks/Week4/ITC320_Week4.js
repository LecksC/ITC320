
var gl;
var points;
var colours;
var worldMatrix;
var worldMatrixLocation;
var timeLocation;
var camera;
var mesh;
window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Triangle
    //

    var texture = loadTexture("textures/Farmhouse TextureAlphaChannel.png");
    //var texture = loadTexture("textures/Farmhouse TextureColourMask.png");
    camera = new firstPersonCamera();

    mesh = new Mesh();
    mesh.addInstance(translate([0,0,0]));
    mesh.DownloadObj("meshes/H1.obj", function(m) {     
        for(var i = 0; i < m.meshParts.length; i++)
        {
            m.meshParts[i].mainTexture = texture; 
	        camera.zoomTo([0,0,0], m.bounds);
        }});

    // First, initialize the corners of our triangle with three points.

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.GL_SAMPLE_ALPHA_TO_COVERAGE);
    ////  Load shaders and initialize attribute buffers
    //var program = initShaders( gl, vBasicShaderCode,
    //                           fBasicShaderCode );
    //gl.useProgram( program );
    //
    //// Load the positional data into the GPU
    //var posBufferId = gl.createBuffer();
    //gl.bindBuffer( gl.ARRAY_BUFFER, posBufferId );
    //gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
	//
    //// Associate out shader variables with our data buffer
    //var vPos = gl.getAttribLocation( program, "aPosition" );
    //gl.vertexAttribPointer( vPos, 3, gl.FLOAT, false, 0, 0 );
    //gl.enableVertexAttribArray( vPos );
//
	///* // Load the colour data into the GPU
    //var colBufferId = gl.createBuffer();
    //gl.bindBuffer( gl.ARRAY_BUFFER, colBufferId );
    //gl.bufferData( gl.ARRAY_BUFFER, flatten(colours), gl.STATIC_DRAW );
	//
    //// Associate out shader variables with our data buffer
    //var vCol = gl.getAttribLocation( program, "aColour" );
    //gl.vertexAttribPointer( vCol, 3, gl.FLOAT, false, 0, 0 );
    //gl.enableVertexAttribArray( vCol ); */
	//
	//// set uniform worldMatrix
	//worldMatrixLocation = gl.getUniformLocation(program, "umWorldMatrix");
	//viewMatrixLocation = gl.getUniformLocation(program, "umViewMatrix");
	//projMatrixLocation = gl.getUniformLocation(program, "umProjMatrix");
	//timeLocation = gl.getUniformLocation(program, "uTime");
	viewMatrix = lookAt([0, 0, -10], [0, 0, 10], [0, 1, 0]);
	projMatrix = perspective(45, 512.0/512.0, 0.1, 10000.0);
	//gl.uniformMatrix4fv(viewMatrixLocation, gl.FALSE, flatten(viewMatrix));
	//gl.uniformMatrix4fv(projMatrixLocation, gl.FALSE, flatten(projMatrix));
	
	
	rotateScaleMatrix = mult(rotate(90, [0, 1, 1]), scalem(0.1, 0.1, 2.0));
	
	gl.enable(gl.DEPTH_TEST);
	initEventHandlers();
    this.requestAnimationFrame(render);
	
};


function render(time)
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	
    handleTiming(time);
    handleInput();
    camera.update(time);

    // Draw in 2 layers for alpha blending.
    //if(mesh.bounds !== null)
    //{
    //    camera.far= 1500;
    //    camera.near = length(subtract(camera.position, mesh.bounds.center));
    //    camera.updateMatrices();
    //    mesh.draw(camera);
    //    camera.near = 0.5;
    //    camera.far= length(subtract(camera.position, mesh.bounds.center));
    //    gl.clear( gl.DEPTH_BUFFER_BIT );
    //}

    camera.updateMatrices();
    mesh.draw(camera);

	
    this.requestAnimationFrame(render);
}


/**
 * Sets up all of the event handlers required for the page.
 * 
 */
function initEventHandlers() {

    window.onkeydown = function(event) {
        switch(event.key) {
            case "w":
            case "W": {
                input.forwardPressed = true;
                break;
            }
            case "s":
            case "S": {
                input.backPressed = true;
                break;
            }
            case "a":
            case "A": {
                input.leftPressed = true;
                break;
            }
            case "d":
            case "D": {
                input.rightPressed = true;
                break;
            }
        }
    };
    window.onkeyup = function(event) {
        switch(event.key) {
            case "w":
            case "W": {
                input.forwardPressed = false;
                break;
            }
            case "s":
            case "S": {
                input.backPressed = false;
                break;
            }
            case "a":
            case "A": {
                input.leftPressed = false;
                break;
            }
            case "d":
            case "D": {
                input.rightPressed = false;
                break;
            }
        }
    };
    canvas.onmousedown = function(e) {
        input.mouseLookStartPosition = vec2(e.clientX, e.clientY);
        input.mouseLookPressed = true;
    };
    canvas.onmouseup =  function(e) {
        input.mouseLookPressed = false;
    };
    canvas.onmousemove = function(e) {
        input.mouseLookCurrentPosition = vec2(e.clientX, e.clientY);
    };
    window.oncontextmenu = function() { return false; };
    window.onresize = onResizeCanvas;

    // Run onResizeCanvas to set up initial viewport.
    onResizeCanvas();
}

/**
 * Event to run when the canvas may have been resized. 
 * 
 * Updates the pixel size for the canvas/context and the aspect ratio for the camera.
 * 
 * Based on code from 
 * @link https://stackoverflow.com/questions/13870677/resize-viewport-canvas-according-to-browser-window-size
 */
function onResizeCanvas() {
    var width = canvas.clientWidth;
    var height = canvas.clientHeight;

    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, canvas.width, canvas.height); 
        camera.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    }
}

/**
 * Values used to keep track of time and statistics.
 *
* @type     {float}
 */
var timing = {
    deltaTime: 0,
    currentTime: 0,
    previousFrameTime: 0,
    elapsedTime: 0,
    frameCount: 0,
    polyCount: 0
};


/**
 * Values used to track input.
 *
 * @type     {boolean}
 * @type     {vec3}
 */
var input = {
    forwardPressed: false,
    backPressed: false,
    leftPressed: false,
    rightPressed: false,
    mouseLookPressed: false,
    mouseLookStartPosition: null,
    mouseLookCurrentPosition: null
};



/**
 * Handles timing (calculates new delta time) and statistics.
 * 
 * @param {float}   frameTime     The total time since the program started.
 */
function handleTiming(frameTime) {
    if(frameTime !== 0.0) {
        timing.currentTime = frameTime * 0.001; 
        timing.deltaTime = timing.currentTime - timing.previousFrameTime;
        timing.previousFrameTime = timing.currentTime;
        timing.elapsedTime += timing.deltaTime;
        if(timing.elapsedTime >= 1) {
            var fps = timing.frameCount;
            timing.frameCount = 0;
            timing.elapsedTime -= 1;
        //    document.getElementById('fps').innerHTML = fps;
        //    document.getElementById('polyCount').innerHTML = timing.polyCount;
        }
    }
    timing.polyCount = 0;
    timing.frameCount++;
}


/**
 * Updates the players position and look direction based on current input.
 *
 */
function handleInput() {
    var forward = 0;
    var right = 0;
    if(input.forwardPressed) {
        forward += 1;
    }
    if(input.backPressed) {
        forward -= 1;
    }
    if(input.rightPressed) {
        right += 1;
    }
    if(input.leftPressed) {
        right -= 1;
    }
    if(input.mouseLookPressed) {
        var lookDelta = subtract(input.mouseLookCurrentPosition, input.mouseLookStartPosition);
        camera.look(-lookDelta[0]*0.5,lookDelta[1]*0.5);
        input.mouseLookStartPosition = input.mouseLookCurrentPosition;
    }
    camera.move(forward*timing.deltaTime*10,right*timing.deltaTime*10);
}

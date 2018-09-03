
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
    //  Configure WebGL
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.DEPTH_TEST);
    // Load textures.
    var bodyTexture = loadTexture("textures/Body.png");
    var headTexture = loadTexture("textures/Head.png");
    // Load the mesh and add an instance, and when done, assign textures to mesh parts.
    mesh = new Mesh();
    mesh.addInstance(translate([0,0,0]));
    mesh.DownloadObj("meshes/Male.obj", function(m) {     
        for(var i = 0; i < m.meshParts.length; i++)
        {
  
            if(m.meshParts[i].name === "body")
            {
                m.meshParts[i].mainTexture = bodyTexture; 
                m.meshParts[i].shader = new Shader(vertexShaderGLSL, fragmentShaderGLSL_Male);
                gl.useProgram( m.meshParts[i].shader.program );
                // Blue
                gl.uniform3f(m.meshParts[i].shader.uTintColor, 0.45, 0.45, 0.8);
                // Red
               // gl.uniform3f(m.meshParts[i].shader.uTintColor, 0.8, 0.45, 0.45);
                // Green
               // gl.uniform3f(m.meshParts[i].shader.uTintColor, 0.45, 0.8, 0.45);

            }
            if(m.meshParts[i].name === "detil")
            {
            m.meshParts[i].mainTexture = headTexture; 
            }
        }});

    // First, initialize the corners of our triangle with three points.
    camera = new firstPersonCamera();
	

	initEventHandlers();
    this.requestAnimationFrame(render);
	
};


function render(time)
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	
    handleTiming(time);
    handleInput();
    
    camera.update(time);
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

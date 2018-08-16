
var gl;
var worldMatrixLocation;
var angle;
var program;
var timeVal=0;
var currentCarColor=0;
var models=[];
var viewProjectionMatrix;
var cameraIndex = 0;
var cameras = [];
var car;
var h1;
var h2;
var h3;
var floor;
var renderList =[[0, [0,0,0], 1.5, 45], //farm house
[1, [0,0,0], 10, 0], //car
]; //ModelId, Position, Scale, Rotation



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

window.onload = function init()
{
	canvas = document.getElementById( "gl-canvas" );
	
	angle = 0;
	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }
	

    car = new Car();
    
    h1 = new Mesh();
    let h1scale = 0.3;
    let h2scale = 5.0;
    let h3scale = 5.0;
    h1.DownloadObj2("H1", 
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

                mesh.addInstance(mult(translate([x, 0, -z]), mult(rotate(180, [0,1,0]), mult(scaleMatrix, centeredMatrix))));
                x += spacingx;

            }
            x = -countx*spacingx*0.5 + center[2]-center[0];
            z += spacingz;
            for(let zi = 1; zi < countz; zi++)
            {
                let scale =1.0 -0.1 * Math.random();
                
                let scaleMatrix = scalem([h1scale*scale,h1scale*scale,h1scale*scale]);
                mesh.addInstance(mult(translate([x, 0, z]), mult(rotate(90, [0,1,0]) , mult(scaleMatrix, centeredMatrix))));

                mesh.addInstance(mult(translate([-x, 0, z]), mult(rotate(270, [0,1,0]), mult(scaleMatrix, centeredMatrix))));
                z += spacingx;

            }
        }
    );
//
    h2 = new Mesh();
    h2.DownloadObj2("H2", 
        function(mesh) {
            let height = -mesh.bounds.min[1];
            let center = mesh.bounds.center;
            let centeredMatrix = translate(-center[0], height, -center[2]);

            let spacingx = (mesh.bounds.size[0])*h2scale+ 1.0;
            let spacingz = (mesh.bounds.size[2])*h2scale+ 4.0;
            let countx = 15;
            let countz = 11;
            let x = -countx*spacingx*0.5;
            let z = -countz*spacingz*0.5;
            
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

                mesh.addInstance(mult(translate([-x, 0, z]), mult(rotate(270, [0,1,0]), mult(scaleMatrix, centeredMatrix))));
                z += spacingz;

            }
        
        });
   // h2.addInstance(translate([-2, 0, 0]));
//
    h3 = new Mesh();
    h3.DownloadObj2("H3", 
        function(mesh) {
            mesh.addInstance(mult(translate([-8, -mesh.bounds.min[1] * h3scale, 0]), scalem([h3scale,h3scale,h3scale])));
        });

        floor = new Mesh();
        floor.DownloadObj2("floor", 
            function(mesh) {
                mesh.addInstance(mult(translate([0, 0, 0]), scalem([10,1,10])));
            });
   // h3.addInstance(translate([-4, 0, 0]));

    
    // First, load the mesh data and push them into models. 
//    models.push(new ObjParser("Assets/meshes/H1.obj"));
//    models.push(new ObjParser("Assets/meshes/floor.obj"));

    //  Load shaders and initialize attribute buffers
//  program = initShaders( gl, "Shaders/BasicShader.vs",
//  	"Shaders/BasicShader.fs" );
//  gl.useProgram( program );
//
// // Associate out shader variables with our data buffer
// var vPos = gl.getAttribLocation( program, "vPosition" );
// gl.enableVertexAttribArray( vPos );
//
// // Associate out shader variables with our data buffer
// var vCol = gl.getAttribLocation( program, "vColour" );
// gl.enableVertexAttribArray( vCol );
//
// for (var modelId = 0; modelId < models.length; modelId++)
//	   for (var s = 0; s<models[modelId].subMeshImageId.length; s++)
//	   {
//	   	   // Store textures into the same models structure. Pay attention to the correspondence of subMesh and texture.
//		   if (models[modelId].subMeshImageName[s]  != null)
//			   models[modelId].subMeshImageId[s] = (new TGAParser("Assets/textures/"+models[modelId].subMeshImageName[s]));
//	   }
//
//  for (var modelId=0;modelId<models.length;modelId++)//models.length
//  {
//		// Load the positional data into the GPU
//		var posBufferId = gl.createBuffer();
//		models[modelId].positionBufferId = posBufferId;
//		gl.bindBuffer( gl.ARRAY_BUFFER, posBufferId );
//		gl.bufferData( gl.ARRAY_BUFFER, flatten(models[modelId].vertexPositions), gl.STATIC_DRAW );
//		
//
//		// Load the colour data into the GPU
//		var colBufferId = gl.createBuffer();
//		models[modelId].textureBufferId = colBufferId;
//		gl.bindBuffer( gl.ARRAY_BUFFER, colBufferId );
//		gl.bufferData( gl.ARRAY_BUFFER, flatten(models[modelId].vertexTextureP), gl.STATIC_DRAW );
//	}	
//	
//	camera = new Camera(vec3(-2, 10, 12), [10,38]);
//	viewProjectionMatrix = mult(perspective(45,1,0.1,1000), camera.viewMatrix);//lookAt(vec3(40,10,50),vec3(0,0,0),vec3(0,1,0))
    var orbit = new orbitCamera();
    orbit.target = car;
    cameras.push(orbit);
    var chase = new chaseCamera();
    chase.target = car;
    cameras.push(chase);
    cameras.push(new firstPersonCamera());

	initEventHandlers();
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
	gl.enable(gl.DEPTH_TEST);
	
	requestAnimationFrame(render);
};

function render(frameTime)
{
	gl.clear( gl.COLOR_BUFFER_BIT |gl.DEPTH_BUFFER_BIT );
	handleTiming(frameTime);
    handleInput();
    car.resetInstances();
    car.update(timing.deltaTime);
    let camera = cameras[cameraIndex];
	camera.update(timing.deltaTime);
    camera.updateMatrices();
    
    car.draw(camera);
    h1.draw(camera);
    h2.draw(camera);
    h3.draw(camera);
    floor.draw(camera);
//	timeVal += 16;
//
//	gl.activeTexture(gl.TEXTURE0);
//
//	// Always use texture 0, the switching of textures can be done by binding new texture to texture 0 object
//	gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
//	
//	
//
//	for (var renderModelId = 0; renderModelId < renderList.length; renderModelId++)
//	{
//		var translateMatrix = mat4();
//		var modelId = renderList[renderModelId][0];
//
//		var currentProgram = program;
//
//		worldMatrixLocation = gl.getUniformLocation(currentProgram, "mWorldMatrix");	
//		var vPos = gl.getAttribLocation( currentProgram, "vPosition" );
//		var vCol = gl.getAttribLocation( currentProgram, "vColour" );
//
//
//		gl.bindBuffer( gl.ARRAY_BUFFER, models[modelId].positionBufferId );
//		gl.vertexAttribPointer( vPos, 3, gl.FLOAT, false, 0, 0 );
//		gl.bindBuffer( gl.ARRAY_BUFFER, models[modelId].textureBufferId);
//		gl.vertexAttribPointer( vCol, 2, gl.FLOAT, false, 0, 0 );
//		
//		var modelScale = renderList[renderModelId][2];
//		var scaleSize = 1.0/models[modelId].radius;	
//       
//       // Move to origin first. -models[modelId].minY makes the parts of model above XZ plane
//		translateMatrix = mult(translate(-models[modelId].center[0], -models[modelId].minY, -models[modelId].center[2]), translateMatrix); 
//
//		translateMatrix = mult(scalem(scaleSize, scaleSize, scaleSize), translateMatrix);
//
//		translateMatrix =  mult(translateMatrix, rotate(renderList[renderModelId][3], 0,1,0)); // Rotation
//		translateMatrix = mult(scalem(modelScale, modelScale, modelScale), translateMatrix); // Scaling
//
//		
//		translateMatrix = mult(translateMatrix, translate(renderList[renderModelId][1][0], renderList[renderModelId][1][1], renderList[renderModelId][1][2])); // Translate
//
//		translateMatrix = mult(viewProjectionMatrix, translateMatrix);
//				
//		gl.uniformMatrix4fv(worldMatrixLocation,gl.FALSE, flatten(translateMatrix));
//		for (var subMeshId = 0;subMeshId < models[modelId].subMeshId.length-1; subMeshId++)
//		{
//			if (models[modelId].subMeshImageId[subMeshId] != null && models[modelId].subMeshImageId[subMeshId].texture != null)
//			{
//				gl.bindTexture(gl.TEXTURE_2D, models[modelId].subMeshImageId[subMeshId].texture);
//				gl.drawArrays( gl.TRIANGLES, models[modelId].subMeshId[subMeshId], models[modelId].subMeshId[subMeshId+1]-models[modelId].subMeshId[subMeshId] ); 
//			}
//		}
//	}
	requestAnimationFrame(render);
}

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
            case "c":
            case "C": {
                cameraIndex = (cameraIndex+1)%cameras.length;
                onResizeCanvas();
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
        cameras[cameraIndex].aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    }
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
        cameras[cameraIndex].look(-lookDelta[0]*0.5,lookDelta[1]*0.5);
        input.mouseLookStartPosition = input.mouseLookCurrentPosition;
    }
    cameras[cameraIndex].move(forward*timing.deltaTime*10,right*timing.deltaTime*10);
}

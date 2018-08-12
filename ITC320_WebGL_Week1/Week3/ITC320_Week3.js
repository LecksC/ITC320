
var gl;
var points;
var colours;
var worldMatrix;
var worldMatrixLocation;
var rot = 0;
var span;
var offset;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
    //
    //  Initialize our data for the Triangle
    //
	
	var cubeObjModel = new ObjParser("assets/H1.obj");
	
    // First, initialize the corners of our triangle with three points.
	points = cubeObjModel.vertexPositions;
	span = cubeObjModel.span;
	offset = cubeObjModel.offset;
	
	//Next, initialize the colours for each corner in Red,Green,Blue
	colours = [];
	
	for (var i = 0; i < points.length/3; i++)
	{
		colours.push(vec3( 1, 0, 0 ));
		colours.push(vec3( 0, 1, 0 ));
		colours.push(vec3( 0, 0, 1 ));
	}
    
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, vBasicShaderCode,
	fBasicShaderCode );
    gl.useProgram( program );
    
    // Load the positional data into the GPU
    var posBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, posBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
	
    // Associate out shader variables with our data buffer
    var vPos = gl.getAttribLocation( program, "aPosition" );
	gl.vertexAttribPointer( vPos, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPos );
	
	//Load the colour data into the GPU
	var colBufferId = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, colBufferId );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(colours), gl.STATIC_DRAW );
	
	//Associate out shader variables with our data buffer
	var vCol = gl.getAttribLocation( program, "aColour" );
	gl.vertexAttribPointer( vCol, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vCol );
	
	// Associate uniform shader variable with our matrix
	worldMatrixLocation = gl.getUniformLocation(program, "umWorldMatrix");
	// worldMatrix = rotate(90, [1, 1, 1]);// mat4();
	
	gl.enable(gl.DEPTH_TEST); 
	
	// render();
	setInterval(render, 16);
};


function render()
{
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT ); 
    var projectionMatrix = perspective(45, 512.0/512.0, 2.1, 10000.0 );
	var viewMatrix = lookAt([0, 0, -20], [0, 0, 10], [0, 1, 0]);
	rot += 0.5;
	// for (var x =-10;x<10;x++)   
	// for (var y =-10;y<10;y++)   
	// for (var z =-10;z<10;z++)
	// {
    worldMatrix = mult(projectionMatrix, mult(viewMatrix, mult(rotate(rot, [0,1,0]), mult(scalem(3.0/span[0], 3.0/span[1], 3.0/span[2]), translate(-offset[0], -offset[1], -offset[2])))));
	// worldMatrix = mult(projectionMatrix, mult(viewMatrix, mult(translate(0, 0, 0), mult(rotate(60, [1,1,1]), scalem(1, 1, 1)))));
	gl.uniformMatrix4fv(worldMatrixLocation, gl.FALSE, flatten(worldMatrix)); 
	gl.drawArrays( gl.TRIANGLES, 0, points.length ); //Draw a single triangle (36 points)
	// }
}

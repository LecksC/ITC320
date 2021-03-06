
var gl;
var points;
var colours;
var worldMatrix;
var worldMatrixLocation;
window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Triangle
    //

    // First, initialize the corners of our triangle with three points.
    points = [
        vec3(-1,  -1, -1), //left side
        vec3(-1,   -1,1),
        vec3(-1,   1,1),
        
        vec3(-1,  -1, -1), //left side
        vec3( -1,   1,1),
        vec3(-1,   1,-1),     

        vec3(1,   1,1),
        vec3(1,   -1,-1),//right side
        vec3(1,   1,-1),
        
        vec3(1,   -1,-1),
        vec3(1,   1,1),//right side
        vec3(1,  - 1,1),        


        vec3(1,   1,1),
        vec3(-1,   1,-1),
        vec3(1,   1,-1),//front side 
        
        vec3(1,   1,1),
        vec3(-1,   1,-1),
        vec3(-1,   1,1),//front side        

        vec3(1,  - 1,1),
        vec3(-1,   -1,-1),
        vec3(1,   -1,-1),//back side 
        
        vec3(1,  - 1,1),
        vec3(-1,   -1,1),
        vec3(-1,   -1,-1),//back side       

        
        vec3(1,   1,-1),
        vec3(-1,   -1,-1),
        vec3(-1,   1,-1),//bottom side  
        
        vec3(1,   1,-1),
        vec3(1,   -1,-1),
        vec3(-1,   -1,-1),//bottom side       
        

        vec3(-1,   1,1),
        vec3(-1,   -1,1),
        vec3(1,   -1,1),//top side  
        
        vec3(1,   1,1),
        vec3(-1,   1,1),
        vec3(1,   -1,1)//top side 
    ];

	//Next, initialize the colours for each corner in Red,Green,Blue
    /* colours = [
        vec3( 1, 0,0 ),
        vec3( 0, 1,0 ),
        vec3( 0, 0,1 ),
		
		vec3( 1, 0,0 ),
        vec3( 0, 1,0 ),
        vec3( 0, 0,1 ),
		
		vec3( 1, 0,0 ),
        vec3( 0, 1,0 ),
        vec3( 0, 0,1 ),
		
		vec3( 1, 0,0 ),
        vec3( 0, 1,0 ),
        vec3( 0, 0,1 ),
		
		vec3( 1, 0,0 ),
        vec3( 0, 1,0 ),
        vec3( 0, 0,1 ),
		
		vec3( 1, 0,0 ),
        vec3( 0, 1,0 ),
        vec3( 0, 0,1 ),
		
		vec3( 1, 0,0 ),
        vec3( 0, 1,0 ),
        vec3( 0, 0,1 ),
		
		vec3( 1, 0,0 ),
        vec3( 0, 1,0 ),
        vec3( 0, 0,1 ),
		
		vec3( 1, 0,0 ),
        vec3( 0, 1,0 ),
        vec3( 0, 0,1 ),
		
		vec3( 1, 0,0 ),
        vec3( 0, 1,0 ),
        vec3( 0, 0,1 ),
		
		vec3( 1, 0,0 ),
        vec3( 0, 1,0 ),
        vec3( 0, 0,1 ),
		
		vec3( 1, 0,0 ),
        vec3( 0, 1,0 ),
        vec3( 0, 0,1 )
    ]; */
	
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
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

	/* // Load the colour data into the GPU
    var colBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, colBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colours), gl.STATIC_DRAW );
	
    // Associate out shader variables with our data buffer
    var vCol = gl.getAttribLocation( program, "aColour" );
    gl.vertexAttribPointer( vCol, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vCol ); */
	
	// set uniform worldMatrix
	worldMatrixLocation = gl.getUniformLocation(program, "uWorldMatrix");
	viewMatrixLocation = gl.getUniformLocation(program, "uViewMatrix");
	projMatrixLocation = gl.getUniformLocation(program, "uProjMatrix");
	viewMatrix = lookAt([-.25, -.25, -10], [-.25, -.25, 10], [0, 1, 0]);
    projMatrix = perspective(45, 512.0/512.0, 0.1, 10000.0);
    var flatProj = flatten(projMatrix);
	gl.uniformMatrix4fv(viewMatrixLocation, gl.FALSE, flatten(viewMatrix));
	gl.uniformMatrix4fv(projMatrixLocation, gl.FALSE, flatProj);
	
	
	rotateScaleMatrix = mult(rotate(0, [0, 1, 1]), scalem(0.1, 0.1, 0.1));
	
	gl.enable(gl.DEPTH_TEST);
	
    this.requestAnimationFrame(render);
	
};


function render(time)
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	
	for (var x =-5;x<5;x++)   
    for (var y =-5;y<5;y++) 
    for (var z =-5;z<5;z++)   
    {

     //Change the transformation
	 worldMatrix = mult(translate(0.5*x, 0.5*y, 0.5*z), rotateScaleMatrix);
     //Push the new transformation to the shader
     gl.uniformMatrix4fv(worldMatrixLocation, gl.FALSE, flatten(worldMatrix));
     //Draw cube
     gl.drawArrays( gl.TRIANGLES, 0, 36 ); //Draw a single triangle (36 points)
    }
}

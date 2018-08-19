
var gl;
var points;
var colours;
var fRotation;
var uRotation;

var vPivot;
var uPivot;

var lastFrameTime = 0;
window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Triangle
    //
    fRotation = 0;

    // First, initialize the corners of our triangle with three points.
    points = [
        vec2( -1, 0 ),
        vec2(  0, 0 ),
        vec2(  0, 1 )
    ];


    vPivot = vec3( -1/3.0, 1/3.0 );
	//Next, initialize the colours for each corner in Red,Green,Blue
    colours = [
        vec3( 1, 0,0 ),
        vec3( 0, 1,0 ),
        vec3( 0, 0,1 )
    ];
	
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, vSpinningShaderCode,
                               fBasicShaderCode );
    gl.useProgram( program );
    
    uRotation = gl.getUniformLocation(program, "uRotation");
    uPivot = gl.getUniformLocation(program, "uPivot");
    uPosition = gl.getUniformLocation(program, "uPosition");
    // Load the positional data into the GPU
    var posBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, posBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
	
    // Associate out shader variables with our data buffer
    var vPos = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( vPos, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPos );

	// Load the colour data into the GPU
    var colBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, colBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colours), gl.STATIC_DRAW );
	
    // Associate out shader variables with our data buffer
    var vCol = gl.getAttribLocation( program, "aColour" );
    gl.vertexAttribPointer( vCol, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vCol );
	this.requestAnimationFrame(render);
};


function render(time)
{
    var deltaTime = time - lastFrameTime;
    lastFrameTime = time;

    gl.clear( gl.COLOR_BUFFER_BIT );
    fRotation += deltaTime*0.01;
    gl.uniform1f(uRotation, fRotation ); 
    gl.uniform2f(uPivot, vPivot[0], vPivot[1] ); 

    gl.drawArrays( gl.TRIANGLES, 0, 3 );
    
	this.requestAnimationFrame(render);
}

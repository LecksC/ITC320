
var gl;
var points;
var colours;

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
        vec2( -1, 0 ),
        vec2(  0, 0 ),
        vec2(  0, 1 )
    ];

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
	
    render();
};


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, 3 ); //Draw a single triangle (3 points)
}

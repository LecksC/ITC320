class Material {
    constructor(vertexShaderCode, fragmentShaderCode) {
        this.program = initShaders( gl, vertexShaderCode, fragmentShaderCode);
        this.worldMatrixLocation = gl.getUniformLocation(program, "uWorldMatrix");
        this.viewMatrixLocation = gl.getUniformLocation(program, "uViewMatrix");
        this.projMatrixLocation = gl.getUniformLocation(program, "uProjMatrix");
    }
}
"use strict";
/**
 * Class to handle a mesh and contain its shader, buffers, and mesh data.
 * 
 * @author: Lecks Chester
 */
class Mesh {
    /**
     * Initializes an empty mesh.
     * 
     * @param {WebGLContext}  gl   The WebGL Context.
     */
    constructor(gl) {
        /**
         * The point positions of the mesh. Should be equal size to normals and colors.
         *
         * @type     {vec3[]}
         */
        this.points = [];
        /**
         * The vertex normals of the mesh. Should be equal size to points and colors.
         *
         * @type     {vec3[]}
         */
        this.normals = [];
        /**
         * The vertex uvs of the mesh. Should be equal size to normals and points.
         *
         * @type     {vec3[]}
         */
        this.uvs = [];
        /**
         * The vertex colors of the mesh. Should be equal size to normals and points.
         *
         * @type     {vec3[]}
         */
        this.colors = [];
        /**
         * The indices of the triangle corners. Every 3 values is 1 triangle.
         *
         * @type     {int[]}
         */
        this.indexs = [];
        /**
         * The world matrices instances.
         *      
         * @type     {mat4[]}
         */
        this.instances = [];
        /**
         * Whether or not the buffers have been updated.
         *
         * Set to true when updated or false when mesh data is modified.
         * @type     {boolean}
         */
        this.buffersUpdated = false;
        /**
         * Whether or not the instance buffer has been updated.
         *
         * Set to true when updated or false when instance data is modified.
         * @type     {boolean}
         */
        this.instancesUpdated = false;
        /**
         * The buffer on vram to hold the points.
         *
         * @type     {WebGLBuffer}
         */
        this.vertexBuffer = gl.createBuffer();
        /**
         * The buffer on vram to hold the vertex normals.
         *
         * @type     {WebGLBuffer}
         */
        this.normalBuffer = gl.createBuffer();
        /**
         * The buffer on vram to hold the vertex colors.
         *
         * @type     {WebGLBuffer}
         */
        this.colorBuffer = gl.createBuffer();
        /**
         * The buffer on vram to hold the vertex texture coordinates.
         *
         * @type     {WebGLBuffer}
         */
        this.texCoordBuffer = gl.createBuffer();
        /**
         * The buffer on vram to hold the indices.
         *
         * @type     {WebGLBuffer}
         */
        this.indexBuffer = gl.createBuffer();
        /**
         * The buffer on vram to hold the instance data.
         *
         * @type     {WebGLBuffer}
         */
        this.instanceBuffer = gl.createBuffer();
        /**
         * Whether or not to use hardware instancing for this mesh.
         *
         * @type     {boolean}
         */
        if (typeof gl.ANGLE_instanced_arrays === 'undefined' || !gl.ANGLE_instanced_arrays) {
            this.enableInstancing = false;
        } else {
            this.enableInstancing = true;
        }

        this.meshParts = [];

        this.mtlFilenames = [];

        this.bounds = new BoundingBox();
    }


    /**
     * Draws the mesh with the given camera.
     * 
     * @param {WebGLContext}    gl      The WebGL Context.
     * @param {Camera}          camera  The camera to draw with.
     * @param {float}           time    The time to send to shaders (if applicable).
     */
    draw(gl, camera, time) {
        // If any data needs to be copied to buffers, do so now.
        if (!this.buffersUpdated) {
            this.updateBuffers(gl);
        }
        if (!this.instancesUpdated && this.enableInstancing) {
            this.updateInstances(gl);
        }

        // Set the element/index buffer to use.
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        // Draw each mesh part.
        for(let p = 0; p < this.meshParts.length; p++)
        {
            var part = this.meshParts[p];

               // Set the current shader and its uniform values.
            gl.useProgram(part.shader.program);

            if(part.mainTexture !== null)
            {
                // Tell WebGL we want to affect texture unit 0
                gl.activeTexture(gl.TEXTURE0);

                // Bind the texture to texture unit 0
                gl.bindTexture(gl.TEXTURE_2D, part.mainTexture);

                // Tell the shader we bound the texture to texture unit 0
                gl.uniform1i(part.shader.uTextureSampler, 0);
            }
            gl.uniformMatrix4fv(part.shader.uViewProjectionMatrix, false, flatten(camera.viewProjection));

            gl.uniform1f(part.shader.uTime, time || 0);
            // Point the shader to the vertex/normal/color/uv buffers (if the shader uses them).
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.vertexAttribPointer(part.shader.aPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(part.shader.aPosition);

            if (part.shader.aNormal > -1) {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
                gl.vertexAttribPointer(part.shader.aNormal, 3, gl.FLOAT, true, 0, 0);
                gl.enableVertexAttribArray(part.shader.aNormal);
            }
            if (part.shader.aColor > -1) {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
                gl.vertexAttribPointer(part.shader.aColor, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(part.shader.aColor);
            }
            if (part.shader.aUV > -1) {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
                gl.vertexAttribPointer(part.shader.aUV, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(part.shader.aUV);
            }

            if (this.enableInstancing) {
                // Draw all of the instances 

                // Tell the shader that the instance data is an array.
                gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
                part.shader.matrixAttribPointerInstanced(gl, part.shader.aInstanceWorldMatrix);

                // Draw the instances and add to statistics.
                gl.ANGLE_instanced_arrays.drawElementsInstancedANGLE(gl.TRIANGLES, part.count, gl.UNSIGNED_SHORT, part.offset*2, this.instances.length);
                game.timing.polyCount += (part.count / 3) * this.instances.length;
                game.timing.drawCallCount++;
            }
            else {
                for (let i = 0; i < this.instances.length; i++) {
                    // Draw an instance of the mesh.

                    // Set the instance matrix on the shader attribute
                    if (part.shader.aInstanceWorldMatrix > -1) {
                        part.shader.matrixAttribPointer(gl, part.shader.aInstanceWorldMatrix, this.instances[i]);
                    }

                    // Draw the instance and add to statistics.
                    gl.drawElements(gl.TRIANGLES, part.count, gl.UNSIGNED_SHORT, part.offset*2);
                    game.timing.polyCount += part.count / 3;
                    game.timing.drawCallCount++;
                }
            }
        }
    }


    /**
     * Copies the data from the point/normal/color arrays to the 
     * appropriate buffers.
     * 
     * @param {WebGLContext}    gl  The WebGL Context.
     */
    updateBuffers(gl) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.points), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.colors), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.uvs), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indexs), gl.STATIC_DRAW);
        this.buffersUpdated = true;
    }


    /**
     * Copies the data from the instance data array to the 
     * instance buffer.
     * 
     * Used only when hardware instancing is enabled.
     * 
     * @param {WebGLContext}    gl  The WebGL Context.
     */
    updateInstances(gl) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.instances), gl.STATIC_DRAW);
        
        this.instancesUpdated = true;
    }


    /**
     * Adds an instance of the mesh.
     * 
     * @param {matrix}    world         The world matrix for the instance. 
     */
    addInstance(world) {
        this.instances.push(world);
        this.instancesUpdated = false;
    }

    /**
     * Adds an instance of the mesh.
     * 
     * @param {vec3}    position    The position of the instance. 
     * @param {vec3}    rotation    The euler angles of the rotation of the instance. 
     * @param {vec3}    scale       The scale of the instance. 
     */
    addInstanceFromVectors(position, rotation, scale) {
        

        let rot = rotate(rotation[2], vec3(0,0,1));
        rot = mult(rotate(rotation[0], vec3(1,0,0)), rot);
        rot = mult(rotate(rotation[1], vec3(0,1,0)), rot);
        this.instances.push(mult(translate(position), mult(rot, scalem(scale))));
        this.instancesUpdated = false;
    }

    /**
     * Clear instances from all meshes so they can be re-added at their new positions.
     * 
     */
    resetInstances()
    {
        this.instances = [];
        this.instancesUpdated = false;
    }

    /**
     * Calculates the bounds for the mesh based on its' current mesh parts.
     * 
     */
    calculateBounds()
    {
        this.bounds = new BoundingBox();
        for(let p = 0; p < this.meshParts.length; p++)
        {
            for(let i = this.meshParts[p].offset; i < this.meshParts[p].offset + this.meshParts[p].count; i++)
            {
                this.bounds.addPoint(this.points[i]);
            }
        }
    }


    /**
     * Copy the references from another mesh into this one. Effectively clones a mesh without needing 
     * to clone all of the buffers.
     * 
     * @param {Mesh}        oldmesh        The mesh to copy references from.
     * @param {integer[]}   partList       List of mesh part indexs to include in the new mesh (this).
     */
    createMeshFromParts(oldmesh, partList)
    {
        this.points = oldmesh.points;
        this.uvs = oldmesh.uvs;
        this.normals = oldmesh.normals;
        this.colors = oldmesh.colors;
        this.indexs = oldmesh.indexs;
        this.vertexBuffer = oldmesh.vertexBuffer;
        this.indexBuffer = oldmesh.indexBuffer;
        this.colorBuffer = oldmesh.colorBuffer;
        this.normalBuffer = oldmesh.normalBuffer;
        this.texCoordBuffer = oldmesh.texCoordBuffer;
        var parts = [];
        for(let i = 0; i < partList.length; i++)
        {
            parts.push(oldmesh.meshParts[partList[i]]);
        }
        this.meshParts = parts;
        this.buffersUpdated = true;
        this.calculateBounds();
    }


    /**
     * Begins the download of an OBJ file.
     * 
     * @param {WebGLContext}    gl          The WebGL Context.
     * @param {string}          fileName    The file name (excluding folder/extension) of the OBJ file to load.
     * @param {function(mesh)}  then        Callback to run when the mesh and materials have loaded.
     */
    downloadObj(gl, fileName, then)
    {
        var xmlhttp = new XMLHttpRequest();
        var self = this;
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
               if (xmlhttp.status === 200) {
                   self.loadObj(gl, xmlhttp.responseText, then);
                }
               else if (xmlhttp.status === 400) {
                  alert('There was an error 400');
               }
               else {
                   alert('something else other than 200 was returned');
               }
            }
        };
    
        xmlhttp.open("GET", "Assets/meshes/" + fileName + ".obj", true);
        xmlhttp.send();
        
    }


    /**
     * Parses a OBJ file into this mesh.
     * 
     * @param {WebGLContext}    gl          The WebGL Context.
     * @param {string}          objCode     The code/data from the OBJ file.
     * @param {function(mesh)}  then        Callback to run when the mesh and materials have loaded.
     * 
     * @author Unknown (provided for assignment).
     */
    loadObj(gl, objCode, then)
    {
        var objCodeLineSplit = objCode.split("\n");
        var meshPartId=[];
        var meshPartMaterialName=[];
        var vt = [];
        var vp = [];
        for (var lineId = 0; lineId<objCodeLineSplit.length; lineId++)
        {
            if (objCodeLineSplit[lineId][0]==='m' && objCodeLineSplit[lineId][1]==='t')
            {
                let posString= objCodeLineSplit[lineId].split(" ");
                this.mtlFilenames.push("Assets/meshes/"+posString[1]);
            }
            if (objCodeLineSplit[lineId][0]==='v' && objCodeLineSplit[lineId][1]===' ')
            {
                let posString= objCodeLineSplit[lineId].split(" ");
                let newPos = [parseFloat(posString[1]),parseFloat(posString[2]),parseFloat(posString[3])];
                vp.push(newPos);
            }
            if (objCodeLineSplit[lineId][0]==='v' && objCodeLineSplit[lineId][1]==='t')
            {
                let textString= objCodeLineSplit[lineId].split(" ");
                let newText = [parseFloat(textString[1]),parseFloat(textString[2])];
                vt.push(newText);
            }	
            if (objCodeLineSplit[lineId][0]==='f' && objCodeLineSplit[lineId][1]===' ')
            {
                let faceString= objCodeLineSplit[lineId].split(" ");
                for (var pointId = 1; pointId < faceString.length; pointId++)
                {
                    let pointString = faceString[pointId].split("/");
                    let positionIndex = parseInt(pointString[0])-1;
                    this.points.push(vp[positionIndex]);
                    let textureIndex = parseInt(pointString[1])-1;
                    this.uvs.push(vt[textureIndex]);
                }
            }

            if (objCodeLineSplit[lineId][0]==='u' && objCodeLineSplit[lineId][1]==='s')
            {
                let posString= objCodeLineSplit[lineId].split(" ");

                // Store the material name to use as the mesh part name so the material can be applied later.
                meshPartMaterialName.push(posString[1]); 
                
                // Store the start point of the current mesh part.
                meshPartId.push(this.points.length);
            }
            
        }
        // Add the end of the last mesh part.
        meshPartId.push(this.points.length);

        for(let i = 0; i < this.points.length; i++)
        {
           this.indexs.push(i);
        }
        for(let i = 0; i < meshPartId.length-1; i++) 
        {
           var mp = new MeshPart(gl, meshPartMaterialName[i], meshPartId[i],  meshPartId[i+1] - meshPartId[i] );
           this.meshParts.push(mp);
        }
        this.buffersUpdated = false;
        this.calculateBounds();

        if(this.mtlFilenames.length > 0)
        {
           let filename = this.mtlFilenames.splice(0, 1)[0];
           this.downloadMtl(gl, filename, then);
        } else if(then !== undefined)
        {
           then(self);
        }
    }


    /**
     * Begins downloading an MTL file.
     * 
     * @param {WebGLContext}    gl           The WebGL Context.
     * @param {string}          fileName     The URL of the MTL file.
     * @param {function(mesh)}  then         Callback to run when the materials have loaded.
     */
    downloadMtl(gl, fileName, then)
    {
        var xmlhttp = new XMLHttpRequest();
        var self = this;
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
               if (xmlhttp.status === 200) {
                    let mtl = new MtlParser(xmlhttp.responseText);
                    self.applyMtl(gl, mtl);
                    if(self.mtlFilenames.length > 0)
                    {
                        let filename = self.mtlFilenames.splice(0, 1)[0];
                        self.downloadMtl(gl, filename, then);
                    } else if(then !== undefined)
                    {
                        then(self);
                    }
               }
               else if (xmlhttp.status === 400) {
                  alert('There was an error 400');
               }
               else {
                   alert('something else other than 200 was returned');
               }
            }
        };
    
        xmlhttp.open("GET", fileName, true);
        xmlhttp.send();

    }


    /**
     * Parses a OBJ file into this mesh.
     * 
     * @param {WebGLContext}    gl          The WebGL Context.
     * @param {string}          mtl         The code/data from the MTL file.
     */
    applyMtl(gl, mtl)
    {
        for(let i = 0; i < this.meshParts.length; i++)
        {
            let mp = this.meshParts[i];
            let imageName = mtl.getTextureName(mp.name);

            if(imageName !== null)
            {
                mp.mainTexture = TGAParser.downloadTGA(gl, "Assets/textures/" + imageName);
            }   
        }
    }

        /**
     * Adds a 3D circular shape from the given 2d polygon cross section to the mesh.
     * 
     * @param {vec2[]}  shapePoints         the 2d polygon that make up the cross section of the shape to lathe.
     * @param {vec3[]}  shapeNormals        the corner normals relative to the shape.
     * @param {vec3}    shapeColor          the color to set for vertices.
     * @param {vec3}    axisNormal          the axis to rotate around.
     * @param {vec3}    axisUp              the axis to treat as up (y in the shape).
     * @param {float}   radius              the radius to extend the lathe shape outwards.
     * @param {int}     sliceCount          the number of slices to create in the lathe.
     * @param {boolean} mirror              whether or not to mirror the points on the x axis.
     */
    addLathe(gl, shapePoints, shapeNormals, shapeColor, axisNormal, axisUp, radius, sliceCount, mirror) {
        this.buffersUpdated = false;
        if (mirror) {
            shapePoints = shapePoints.slice(0);
            shapeNormals = shapeNormals.slice(0);
            for (let i = shapePoints.length - 1; i >= 0; i--) {
                if ((i == 0 || shapePoints.length - 1) && shapePoints[i].x == 0) {
                    continue;
                }
                shapePoints.push(vec3(-shapePoints[i][0], shapePoints[i][1]));
                shapeNormals.push(vec3(-shapeNormals[i][0], shapeNormals[i][1]));
            }
            shapePoints.push(vec3(shapePoints[0][0], shapePoints[0][1]));
            shapeNormals.push(vec3(shapeNormals[0][0], shapeNormals[0][1]));
        }
        var startindex = this.points.length;
        for (let i = 0; i < shapePoints.length; i++) {
            let point = shapePoints[i];
            let normal = shapeNormals[i];
            let color = shapeColor;
            if (normal == null) {
                normal = vec3(0, 1, 0);
            }
            if (color == null) {
                color = vec3(1, 0, 1);
            }
            let pointToRotate = add(scale(point[0], axisNormal), scale(point[1] + radius, axisUp));
            let normalToRotate = add(scale(normal[0], axisNormal), scale(normal[1], axisUp));
            for (let s = 0; s < sliceCount; s++) {
                let degrees = (s / (sliceCount - 1)) * 360;
                if (s < (sliceCount - 1)) {
                    this.points.push(rotateAroundAxis(pointToRotate, axisNormal, degrees));
                    this.normals.push(rotateAroundAxis(normalToRotate, axisNormal, degrees));
                    this.colors.push(color);
                }
                if (s > 0 && i > 0) {
                    if (s < (sliceCount - 1)) {
                        this.indexs.push(startindex + i * (sliceCount - 1) + s);
                        this.indexs.push(startindex + i * (sliceCount - 1) + s - 1);
                        this.indexs.push(startindex + (i - 1) * (sliceCount - 1) + s - 1);
                        this.indexs.push(startindex + i * (sliceCount - 1) + s);
                        this.indexs.push(startindex + (i - 1) * (sliceCount - 1) + s - 1);
                        this.indexs.push(startindex + (i - 1) * (sliceCount - 1) + s);
                    }
                    else {
                        this.indexs.push(startindex + i * (sliceCount - 1));
                        this.indexs.push(startindex + i * (sliceCount - 1) + s - 1);
                        this.indexs.push(startindex + (i - 1) * (sliceCount - 1) + s - 1);
                        this.indexs.push(startindex + i * (sliceCount - 1));
                        this.indexs.push(startindex + (i - 1) * (sliceCount - 1) + s - 1);
                        this.indexs.push(startindex + (i - 1) * (sliceCount - 1));
                    }
                }
            }
        }
        let mp = new MeshPart(gl, "lathe", 0, this.indexs.length);
        mp.shader = new Shader(gl, Game.GLSL.vsColor, Game.GLSL.fsColor);
        this.meshParts.push(mp);
        this.buffersUpdated = false;
    }

}




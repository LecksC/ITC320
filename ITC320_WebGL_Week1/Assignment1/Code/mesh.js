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
     * @param {Shader}  shader   the shader to use to draw the mesh.
     */
    constructor() {
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
     * @param {camera} camera 
     */
    draw(camera, time) {
        // If any data needs to be copied to buffers, do so now.
        if (!this.buffersUpdated) {
            this.updateBuffers();
        }
        if (!this.instancesUpdated && this.enableInstancing) {
            this.updateInstances();
        }



        // Set the element/index buffer to use.
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

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
            } else { continue; }
            gl.uniformMatrix4fv(part.shader.uViewProjectionMatrix, false, flatten(camera.viewProjection));

            gl.uniform1f(part.shader.uTime, time || 0);
            // Point the shader to the vertex/normal/color buffers (if the shader uses them).
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
                // WebGL2 would use the following instead of the extension: 
                // gl.vertexAttribDivisor(this.shader.vInstanceData, 1);
                // gl.drawElementsInstanced(gl.TRIANGLES, this.indexs.length, gl.UNSIGNED_SHORT, 0, this.instances.length);  

                // Point the shader to the instance buffer.
                gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);



                part.shader.matrixAttribPointerInstanced(part.shader.aInstanceWorldMatrix);
               // gl.vertexAttribPointer(part.shader.aInstanceWorldMatrix, 16, gl.FLOAT, false, 0, 0);
                // Tell the shader that the instance data is an array.

                // gl.uniformMatrix4fv(this.shader.uModelViewMatrix, false, flatten(translate(0, 0, 0)));
                // Draw the instances.
                gl.ANGLE_instanced_arrays.drawElementsInstancedANGLE(gl.TRIANGLES, part.count, gl.UNSIGNED_SHORT, part.offset*2, this.instances.length);

                // Add the polygon count (for statistics).
                game.timing.polyCount += (part.count / 3) * this.instances.length;
            }
            else {
                for (let i = 0; i < this.instances.length; i++) {
                    if (part.shader.aInstanceWorldMatrix > -1) {
                        //gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
                        // Tell the shader that the instance data is uniform.
                       // gl.disableVertexAttribArray(part.shader.aInstanceWorldMatrix);
                       // gl.bufferData(gl.ARRAY_BUFFER, flatten(this.instances[i]), gl.STATIC_DRAW);
                        part.shader.matrixAttribPointer(part.shader.aInstanceWorldMatrix, this.instances[i]);
                      //  gl.vertexAttribPointer(part.shader.aInstanceWorldMatrix, 16, gl.FLOAT, false, 0, 0);
                     //  gl.vertexAttrib(part.shader.aInstanceWorldMatrix, flatten());
                    }
                      gl.uniformMatrix4fv(part.shader.uModelViewMatrix, false, flatten(translate(0, 0, 0)));
                    gl.drawElements(gl.TRIANGLES, part.count, gl.UNSIGNED_SHORT, part.offset*2);
                    game.timing.polyCount += part.count / 3;
                }
            }
        }
    }


    /**
     * Copies the data from the point/normal/color arrays to the 
     * appropriate buffers.
     * 
     */
    updateBuffers() {
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
     */
    updateInstances() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.instances), gl.STATIC_DRAW);
        
        this.instancesUpdated = true;
    }


    /**
     * Adds an instance of the mesh.
     * 
     * @param {vec3}    pos         the position to place the instance. Y axis will be ignored. 
     * @param {float}   rotation     the horizontal scale of the instance.
     * @param {float}   scaley      the vertical scale of the instance.
     * @param {float}   yrotation   the rotation of the instance around the up axis.
     */
    addInstance(world) {
        this.instances.push(world);
        this.instancesUpdated = false;
    }


    /** 
     * Recalculates all of the normals on the mesh as smooth normals using the method described at
     * @link https://stackoverflow.com/questions/45477806/general-method-for-calculating-smooth-vertex-normals-with-100-smoothness
     * 
     */
    calculateNormals() {
        // Clear the existing normals.
        for (let i = 0; i < this.normals.length; i++) {
            this.normals[i] = vec3(0, 0, 0);
        }
        // Add normals from all triangles.
        for (let i = 0; i < this.indexs.length; i += 3) {
            let i1 = this.indexs[i];
            let i2 = this.indexs[i + 1];
            let i3 = this.indexs[i + 2];
            let p1 = this.points[i1];
            let p2 = this.points[i2];
            let p3 = this.points[i3];
            let n = CalculateSurfaceNormalNewell(p3, p2, p1);
            if (!isFinite(length(n)) || length(n) == 0) {
                console.log("invalid normal: " + n);
                n = vec3(0, 0, 0);
            }
            let a1 = (angleBetween(p1, p2, p3));
            let a2 = (angleBetween(p2, p1, p3));
            let a3 = (angleBetween(p3, p1, p2));
            this.normals[i1] = add(this.normals[i1], vec3(n[0] * a1, n[1] * a1, n[2] * a1));
            this.normals[i2] = add(this.normals[i2], vec3(n[0] * a2, n[1] * a2, n[2] * a2));
            this.normals[i3] = add(this.normals[i3], vec3(n[0] * a3, n[1] * a3, n[2] * a3));
        }
        
        // Normalize results.
        for (let i = 0; i < this.normals.length; i++) {
            let n = this.normals[i];
            if (n[0] == 0 && n[1] == 0 && n[2] == 0) {
                console.log("No normal for " + i);
                this.normals[i] = vec3(0, 0, 0);
            }
            else {
                this.normals[i] = normalize(n);
            }
        }
    }

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


    downloadMtl(fileName, then)
    {
        var xmlhttp = new XMLHttpRequest();
        var self = this;
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
               if (xmlhttp.status === 200) {
                    let mtl = new MtlParser(xmlhttp.responseText);
                    self.applyMtl(mtl);
                    if(self.mtlFilenames.length > 0)
                    {
                        let filename = self.mtlFilenames.splice(0, 1)[0];
                        self.downloadMtl(filename, then);
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
    DownloadObj2(fileName, then)
    {
        var xmlhttp = new XMLHttpRequest();
        var self = this;
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
               if (xmlhttp.status === 200) {
                   self.LoadObj2(xmlhttp.responseText, then);
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

    LoadObj2(objCode, then)
    {
        var objCodeLineSplit = objCode.split("\n");
        var subMeshId=[];
        var subMeshMaterialName=[];
        var vt = [];
        var vp = [];
        for (var lineId = 0; lineId<objCodeLineSplit.length; lineId++)
        {
            // "mtllib" keyword in obj file tells which material file is used
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

            /* "usemtl" keyword tells which material file will be used afterwards.
            In the material file, you can find the corresponding texture file using
            the getTextureName method of MtlParser.*/

            if (objCodeLineSplit[lineId][0]==='u' && objCodeLineSplit[lineId][1]==='s')
            {
                let posString= objCodeLineSplit[lineId].split(" ");

                // subMeshImageName stores the texture file name, i.e., TGA file name
                subMeshMaterialName.push(posString[1]); 
                
                /* subMeshId stores the vertex offset when a new material and texture is used.
                subMeshId will be used when gl.drawArrays is invoked to draw different part of an object, e.g., a car
                */
                subMeshId.push(this.points.length);
            }
            
        }
        
     
        subMeshId.push(this.points.length);

        for(let i = 0; i < this.points.length; i++)
        {
           this.indexs.push(i);
        }
        for(let i = 0; i < subMeshId.length-1; i++) 
        {
           var mp = new MeshPart(subMeshMaterialName[i], subMeshId[i],  subMeshId[i+1] - subMeshId[i] );
           this.meshParts.push(mp);
        }
        this.buffersUpdated = false;
        this.calculateBounds();
        
        if(this.mtlFilenames.length > 0)
        {
           let filename = this.mtlFilenames.splice(0, 1)[0];
           this.downloadMtl(filename, then);
        } else if(then !== undefined)
        {
           then(self);
        }
    }


    applyMtl(mtl)
    {
        for(let i = 0; i < this.meshParts.length; i++)
        {
            let mp = this.meshParts[i];
            let imageName = mtl.getTextureName(mp.name);

            if(imageName !== null)
            {
                mp.mainTexture = (new TGAParser("Assets/textures/" + imageName)).texture;
            }   
        }
    }

// then is function to run that is passed the mesh after it's downloaded
    // based on https://stackoverflow.com/questions/8567114/how-to-make-an-ajax-call-without-jquery
    DownloadObj(filename, then)
    {
        var xmlhttp = new XMLHttpRequest();
        var self = this;
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
               if (xmlhttp.status === 200) {
                   self.LoadObj(xmlhttp.responseText);
                   if(then !== undefined)
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
    
        xmlhttp.open("GET", filename, true);
        xmlhttp.send();
    }
    LoadObj(str)
    {
        console.log(str);
        //from https://stackoverflow.com/questions/35254086/how-to-split-a-string-on-line-spaces-breaks-in-javascript
        var lines = str.split(/(\r\n|\n|\r)/gm);
        var currentMaterial = "no material";
        var name = "";
        var objectName = "";
        var rawvertices = [];
        var rawnormals = [];
        var rawuvs = [];
        var rawpositionindexs = {};
        var rawuvindexs = {};
        var rawnormalindexs = {};
        var lineNo = 1;
        for(let i = 0; i < lines.length; i++)
        {
            var line = lines[i];
            try
            {
                var firstwordlength = line.indexOf(' ');
                if (line.length > 2 && firstwordlength > 0)
                {
                    
                    var firstword = line.substring(0, firstwordlength);
                    var restOfLine = line.substring(firstwordlength+1, line.length);
                    switch(firstword.toLowerCase())
                    {
                        case "o":
                            {
                                //Ignore object definitions.. separate by materials
                                break;
                            }
                        case "g":
                            {
                                break;
                            }
                        case "v":
                            {
                                rawvertices.push(this.StringToVector(restOfLine));
                                break;
                            }
                        case "vn":
                            {
                                rawnormals.push(this.StringToVector(restOfLine));
                                break;
                            }
                        case "vt":
                            {
                                rawuvs.push(this.StringToVector(restOfLine));
                                break;
                            }
                        case "usemtl":
                            {

                                currentMaterial = restOfLine;
                                if (rawpositionindexs[currentMaterial] == undefined || !rawpositionindexs[currentMaterial])
                                {
                                    rawpositionindexs[currentMaterial] = [];
                                    rawuvindexs[currentMaterial] = [];
                                    rawnormalindexs[currentMaterial] = [];
                                }
                                break;
                            }
                        case "usemap":
                            {
                               
                                currentMaterial = restOfLine;
                                if (rawpositionindexs[currentMaterial] == undefined || !rawpositionindexs[currentMaterial])
                                {
                                    rawpositionindexs[currentMaterial] = [];
                                    rawuvindexs[currentMaterial] = [];
                                    rawnormalindexs[currentMaterial] = [];
                                }

                                break;
                            }
                        case "f":
                            {
                                rawpositionindexs[currentMaterial].push(this.GetIndexs(restOfLine, 1, 0));
                                rawpositionindexs[currentMaterial].push(this.GetIndexs(restOfLine, 0, 0));
                                rawpositionindexs[currentMaterial].push(this.GetIndexs(restOfLine, 2, 0));

                                
                                rawuvindexs[currentMaterial].push(this.GetIndexs(restOfLine, 1, 1));
                                rawuvindexs[currentMaterial].push(this.GetIndexs(restOfLine, 0, 1));
                                rawuvindexs[currentMaterial].push(this.GetIndexs(restOfLine, 2, 1));

                                rawnormalindexs[currentMaterial].push(this.GetIndexs(restOfLine, 1, 2));
                                rawnormalindexs[currentMaterial].push(this.GetIndexs(restOfLine, 0, 2));
                                rawnormalindexs[currentMaterial].push(this.GetIndexs(restOfLine, 2, 2));
                                break;
                            }
                    }
                }
                lineNo++;
            } catch(ex)
            {
                console.log("Error in line " + lineNo, ex);
            }

        }
        var colors = [[1,0,0], [0,1,0], [0,0,1]];
        for(var partname in rawpositionindexs)
        {
            var offset = this.indexs.length;
            var vertCount = rawpositionindexs[partname].length;

            for(let t = 0; t < vertCount; t++)
            {
                var posIndex = rawpositionindexs[partname][t];
        
                var pos = rawvertices[posIndex];
                this.points.push(pos);

                var uvIndex = rawuvindexs[partname][t];
                if(uvIndex >= 0) {
                    //flip the Y coordinate
                    this.uvs.push([rawuvs[uvIndex][0], -rawuvs[uvIndex][1]] );
                } else {
                    console.log("invalid uvs for vertex " + t);
                    this.uvs.push([0,0]);
                }

                var normalIndex = rawnormalindexs[partname][t];
                if(normalIndex >= 0) {
                    this.normals.push(rawnormals[normalIndex]);
                } else {
                    this.normals.push([0,1,0]);
                }

                this.colors.push(colors[this.points.length%3]);
                this.indexs.push(this.points.length-1);
                
            }
            this.meshParts.push(new MeshPart(partname, offset*2, vertCount));
            console.log(partname);
        }
    console.log(this.points);
    console.log(this.indexs);
    this.buffersUpdated =false;
    }
    // index = 0 1 or 2 for which vertex in the triangle.
    // indexType = 0 for pos, 1 for tex coord, 2 for normal
    GetIndexs(str, index, indexType )
    {
        var vert = str.split(" ")[index];

        var split = vert.split('/');

        var val = -1;
        if(split.length > indexType)
        {
            var numberstr = split[indexType];
       
            val = parseInt(numberstr) - 1;
        }
        if(!isFinite(val))
        {
            console.log("Invalid value: " + split + "\nin:" + str);

        }

        return val;
  
    }
    StringToVector(str)
        {
            var split = str.split(' ');
            try
            {
                switch (split.length)
                {
                    case 2:
                        {
                            return [parseFloat(split[0]), parseFloat(split[1])];
                            
                        }
                    case 3:
                        {
                            return [parseFloat(split[0]), parseFloat(split[1]), parseFloat(split[2])];
                        }
                    default:
                        {

                            throw new Exception("Invalid vector length for 'vector': " + str);
                        }


                }
            } catch (ex)
            {
                console.log("Invalid number in 'vector': " + str, ex);
            }
            
            console.log("Invalid number in 'vector': " + str, ex);
        }
}




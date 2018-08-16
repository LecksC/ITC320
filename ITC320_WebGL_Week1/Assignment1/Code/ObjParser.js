
function ObjParser(fileName){
	objCode = loadFileAJAX(fileName);
    if (!objCode) {
       alert("Could not find shader source: "+fileName);
    }
	
	var objCodeLineSplit = objCode.split("\n")
	//console.log(objCodeLineSplit.length)
	vp = []
	vt = []
	this.vertexPositions = []
	this.vertexTextureP = []
	tempMinMax= [[],[],[]]
	this.subMeshId=[];
	this.subMeshImageName=[];
	this.subMeshImageId=[];
	
	
	var mtlFile;
	for (var lineId =0; lineId<objCodeLineSplit.length;lineId++)
	{
		// "mtllib" keyword in obj file tells which material file is used
		if (objCodeLineSplit[lineId][0]=='m' && objCodeLineSplit[lineId][1]=='t')
		{
			posString= objCodeLineSplit[lineId].split(" ");
			mtlFile = new MtlParser("Assets/meshes/"+posString[1]);
		}

		if (objCodeLineSplit[lineId][0]=='v' && objCodeLineSplit[lineId][1]==' ')
		{
			posString= objCodeLineSplit[lineId].split(" ");
			newPos = [parseFloat(posString[1]),parseFloat(posString[2]),parseFloat(posString[3])]
			vp.push(newPos)
			if (tempMinMax[0].length==0)
			{		
				tempMinMax[0]=[newPos[0],newPos[0]];
				tempMinMax[1]=[newPos[1],newPos[1]];
				tempMinMax[2]=[newPos[2],newPos[2]];
			}
			else
			{
				if (tempMinMax[0][0]<newPos[0])
					tempMinMax[0][0]=newPos[0];
				if (tempMinMax[0][1]>newPos[0])
					tempMinMax[0][1]=newPos[0];	
				if (tempMinMax[1][0]<newPos[1])
					tempMinMax[1][0]=newPos[1];
				if (tempMinMax[1][1]>newPos[1])
					tempMinMax[1][1]=newPos[1];	
				if (tempMinMax[2][0]<newPos[2])
					tempMinMax[2][0]=newPos[2];
				if (tempMinMax[2][1]>newPos[2])
					tempMinMax[2][1]=newPos[2];					
			}
		}
		if (objCodeLineSplit[lineId][0]=='v' && objCodeLineSplit[lineId][1]=='t')
		{
			textString= objCodeLineSplit[lineId].split(" ")
			newText = [parseFloat(textString[1]),parseFloat(textString[2])]
			vt.push(newText)
		}	
		if (objCodeLineSplit[lineId][0]=='f' && objCodeLineSplit[lineId][1]==' ')
		{
			faceString= objCodeLineSplit[lineId].split(" ")
			for (var pointId=1;pointId< faceString.length;pointId++)
			{
				pointString = faceString[pointId].split("/")
				positionIndex = parseInt(pointString[0])-1
				this.vertexPositions.push(vp[positionIndex])
				textureIndex = parseInt(pointString[1])-1
				this.vertexTextureP.push(vt[textureIndex])
			}
		}

		/* "usemtl" keyword tells which material file will be used afterwards.
		   In the material file, you can find the corresponding texture file using
		   the getTextureName method of MtlParser.*/

		if (objCodeLineSplit[lineId][0]=='u' && objCodeLineSplit[lineId][1]=='s')
		{
			posString= objCodeLineSplit[lineId].split(" ");

			
			var textureFileName = mtlFile.getTextureName(posString[1]);
			
			// subMeshImageName stores the texture file name, i.e., TGA file name
			this.subMeshImageName.push(textureFileName); 
			
			/*subMeshImageId is supposed to store the texture object, i.e., the object returned by TGAParser.
			  You can do it in your main program when loading textures from TGA files */
			this.subMeshImageId.push(null); 

			/* subMeshId stores the vertex offset when a new material and texture is used.
			   subMeshId will be used when gl.drawArrays is invoked to draw different part of an object, e.g., a car
			*/
			this.subMeshId.push(this.vertexPositions.length);
		}
		
	}
	
	console.log(tempMinMax)
	this.minY = tempMinMax[1][1];
	this.subMeshId.push(this.vertexPositions.length);
	this.center = vec3((tempMinMax[0][1]+tempMinMax[0][0])*0.5,(tempMinMax[1][1]+tempMinMax[1][0])*0.5,(tempMinMax[2][1]+tempMinMax[2][0])*0.5);
	this.radius = Math.sqrt((tempMinMax[0][1]-this.center[0])*(tempMinMax[0][1]-this.center[0]) +(tempMinMax[1][1]-this.center[1])*(tempMinMax[1][1]-this.center[1]) +(tempMinMax[2][1]-this.center[2])*(tempMinMax[2][1]-this.center[2]) );
	console.log("Model :",this.center,"Radius",this.radius);
	//console.log(this.subMeshImageName);
}
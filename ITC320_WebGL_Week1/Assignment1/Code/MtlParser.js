
function MtlParser(fileName){
	objCode = loadFileAJAX(fileName);
    if (!objCode) {
       alert("Could not material source: "+fileName);
    }
	
	var objCodeLineSplit = objCode.split("\n")

	this.materialNames = [];

	// establish the correspondence between material name and texture (TGA) file name 
	for (var lineId =0; lineId<objCodeLineSplit.length;lineId++)
	{
		if (objCodeLineSplit[lineId][0]=='n' && objCodeLineSplit[lineId][1]=='e')
		{
			posString= objCodeLineSplit[lineId].split(" ");
			this.materialNames.push([posString[1],null]);
		}
		if (objCodeLineSplit[lineId][0]=='m' && objCodeLineSplit[lineId][1]=='a')
		{
			posString= objCodeLineSplit[lineId].split(" ");
			this.materialNames[this.materialNames.length-1][1] = posString[1];
		}	
		
	}

	// getTextureName method is used to retrieve the TGA file name for the given material name
	this.getTextureName = function(matName)
	{
		for (var i =0;i<this.materialNames.length;i++)
			if (matName==this.materialNames[i][0])
				return this.materialNames[i][1];
		return null;
	}
	//console.log(this.materialNames);

}
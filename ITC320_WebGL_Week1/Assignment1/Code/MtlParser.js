
class MtlParser {
	constructor(mtlCode)
	{
		let mtlCodeLineSplit = mtlCode.split("\n");
		this.materialNames = [];

		// establish the correspondence between material name and texture (TGA) file name 
		for (var lineId =0; lineId < mtlCodeLineSplit.length; lineId++)
		{
			if (mtlCodeLineSplit[lineId][0] === 'n' && mtlCodeLineSplit[lineId][1] === 'e')
			{
				let posString= mtlCodeLineSplit[lineId].split(" ");
				this.materialNames.push([posString[1],null]);
			}
			if (mtlCodeLineSplit[lineId][0] === 'm' && mtlCodeLineSplit[lineId][1] === 'a')
			{
				let posString= mtlCodeLineSplit[lineId].split(" ");
				this.materialNames[this.materialNames.length-1][1] = posString[1];
			}	
			
		}
	}
	// getTextureName method is used to retrieve the TGA file name for the given material name
	getTextureName(matName)
	{
		for (let i = 0; i < this.materialNames.length; i++)
			if (matName === this.materialNames[i][0])
				return this.materialNames[i][1];
		return null;
	}
}
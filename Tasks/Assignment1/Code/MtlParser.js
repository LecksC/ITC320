"use strict";
/**
 * Class to parse and store data for an MTL file.
 * 
 * @author Unknown (provided for assignment).
 * @author by Lecks Chester.
 */
class MtlParser {
	/**
	 * Parses the MTL file and stores the important data within (currently just .
	 * 
	 * @param {string} mtlCode The contents of the MTL file.
	 */
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


	/**
	 * Get the texture name for the given material name.
	 * 
	 * @param {string} matName The name of the material.
	 * 
	 * @returns {string}	The texture name (or null).
	 */
	getTextureName(matName)
	{
		for (let i = 0; i < this.materialNames.length; i++)
			if (matName === this.materialNames[i][0])
				return this.materialNames[i][1];
		return null;
	}
}
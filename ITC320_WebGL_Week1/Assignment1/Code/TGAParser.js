"use strict";
/**
 * Contains static functions to download and parse TGA files and create WebGL textures from them.
 * 
 * @author 	Unknown (provided for assignment).
 * @author  Lecks Chester
 */
class TGAParser {

	/**
	 * Parses a TGA file and writes its' data to the specified texture.
	 * 
	 * @param {WebGLContext} 	gl 				The WebGL context.
	 * @param {WebGLTexture} 	texture			The texture to write the decoded data to. 
	 * @param {byte[]} 			binaryData		The raw binary data for the TGA file. 
	 */
	static parseTGAFile(gl, texture, binaryData)
	{
		var binaryDataUint8Array= new Uint8Array(binaryData);
		var width = binaryDataUint8Array[12] +(binaryDataUint8Array[13]<<8);//15 14
		var height = binaryDataUint8Array[14] +(binaryDataUint8Array[15]<<8);//15 14
		var pixelDepth = binaryDataUint8Array[16];//24 bits for 3 channels bgr / 32 bits for 4 channels bgra
		var nChannels = pixelDepth/8;
		
		// Reformat the binaryDataUint8Array data to begin with the image data (offset the data by -18 bytes)
		for (var i =0; i < width * height * nChannels; i += nChannels)
		{
			binaryDataUint8Array[i]= binaryDataUint8Array[i+18+2]; //blue
			binaryDataUint8Array[i+1]=binaryDataUint8Array[i+18+1]; //green
			binaryDataUint8Array[i+2]= binaryDataUint8Array[i+18]; //red
		}
	
		// Sets the current WebGL texture to the newly created texture
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,  width,height, 0,gl.RGB,gl.UNSIGNED_BYTE, binaryDataUint8Array);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); 
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST); 
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); 
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT); 
		gl.generateMipmap(gl.TEXTURE_2D);
	}


	/**
	 * Starts a download of a TGA file and returns a reference to a placeholder for it.
	 * 
	 * @param {WebGLContext} 	gl 			The WebGL context.
	 * @param {string} 			fileName 	The URL of the file to load.
	 * 
	 * @returns {WebGLTexture}	Reference to the placeholder that will become the requested texture, or the texture itself.
	 */
	static downloadTGA(gl, fileName) 
	{
		// Check if the tga is in the cache, and if so return it.
		if(TGAParser.tgaCache[fileName] !== undefined)
		{
			return TGAParser.tgaCache[fileName];
		}

		// Create a blank blue texture and add it to the cache.
		let texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
					1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
					new Uint8Array([0, 0, 255, 255]));	
		TGAParser.tgaCache[fileName] = texture;

		//Create the HTTP request to download the texture.
		var oReq;   
		if (window.XMLHttpRequest)
		{       
			oReq = new XMLHttpRequest(); 
		}
		if (oReq !== null)
		{  
			oReq.parser= this;
			oReq.open("GET", fileName, true); 
			oReq.responseType = "arraybuffer";
			oReq.onreadystatechange = function()
			{       
				if (oReq.readyState === 4 && oReq.status === 200)
				{
					TGAParser.parseTGAFile(gl,texture,oReq.response,oReq.parser);           
				}       
			};
			oReq.send();   
		}   
		else
		{         
			window.alert("Error creating XmlHttpRequest object.");   
		}

		// Return the (currently blank/blue) texture.
		return texture;
	}
}
TGAParser.tgaCache = {};
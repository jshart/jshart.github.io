// This object is a wrapper to provide additional functionality to the
// core terrain map matrix, helping to map the raw data into objects
// which can be drawn on the actual display. Effectively this is the
// "bridge" object between the raw data and the browser/display

function TerrainMapDisplayWrapper(canvasCtx,originX,originY,width,height) {
	this.canvasCtx = canvasCtx;
	this.originX = originX;
	this.originY = originY;
	this.width = width;
	this.height = height;
	
	this.rawImageData=0;
	
	this.myMap = new TerrainMap(width,height);
	
	// by default the current layer is pointing at the terrainMap,
	// so simply go ahead and generate the layer.
	this.myMap.generateTerrain();
	
	// Next we move the current layer to point to the cloud so we can
	// generate that.
	this.myMap.currentLayer = this.myMap.cloudLayer;
	this.myMap.generateTerrain();
}

TerrainMapDisplayWrapper.prototype.saveImage = function()
{
	this.myMap.rawImageData=this.canvasCtx.getImageData(this.originX,this.originY,this.width,this.height);
}


TerrainMapDisplayWrapper.prototype.restoreImage = function()
{
	this.canvasCtx.putImageData(this.myMap.rawImageData,this.originX,this.originY);
}

TerrainMapDisplayWrapper.prototype.drawLayer = function(layer,filter)
{
	this.myMap.currentLayer = layer;
	this.myMap.drawTerrainMapImageToCanvas(this.originX,this.originY,this.canvasCtx,filter);
}


TerrainMapDisplayWrapper.prototype.addPlanetFilter = function()
{
	var x,y;
	
	x = (this.width/2)+this.originX;
	y = (this.height/2)+this.originY;
	
	// Now that we've draw the maps, do the planet shape mask.
	this.canvasCtx.save();	
	this.canvasCtx.globalCompositeOperation="destination-atop";
	this.canvasCtx.translate(x,y);
	this.canvasCtx.beginPath();
	this.canvasCtx.arc(0,0,this.width/2,0,2*Math.PI);
	this.canvasCtx.fillStyle='blue';
	this.canvasCtx.fill();
	this.canvasCtx.restore();

	// Now fill in the "space" around the planet, with well.. space.
	this.canvasCtx.globalCompositeOperation="destination-atop";
	this.canvasCtx.beginPath();
	this.canvasCtx.fillStyle='black';
	this.canvasCtx.fillRect(this.originX,this.originY,this.width,this.height);
}
// This class provides the code for actually generating a terrain
// matrix using one or more filter.


// Terrain Filters - at each "stop" switch to new sub-filter.
// r,g,b,a provides "start point" for the transition. This is then adjust
// for each value of height based on the dr,dg,db,da values (delta rgba)
// a negative value will "flip" the transition and *reduce* the colour
// intensity for each step - for example, in the "sea", you want the colour
// to get darker (less intense/vivide) the deeper you go.
//
// Use of the alpha channel lets us generate clouds and atmosphere on top
// of the map, and is mainly used in the sky filters. set all alpha values
// to '1' to stick to solid colors.
// TODO maybe come back and invert all these ranges, so we actually have a height
// that goes up with terrain rather than down.
var terrainFilters = {
	'earthNoBeach':[ // this has been sorted so height goes in the right direction with colour
		{'stop':150, 'r':0, 'g':0, 'b':200, 'a':255, 'dr':0, 'dg':0, 'db':1, 'da':1, 'cycle':0, 'cycleDelta':0},
		{'stop':255, 'r':0, 'g':255, 'b':0, 'a':255, 'dr':0, 'dg':-1, 'db':0, 'da':1, 'cycle':0, 'cycleDelta':0}
		],
	'earthBeach':[
		{'stop':140, 'r':0, 'g':1, 'b':0, 'a':255, 'dr':0, 'dg':1, 'db':0, 'da':1, 'cycle':0, 'cycleDelta':0},
		{'stop':150, 'r':200, 'g':200, 'b':0, 'a':255, 'dr':5, 'dg':10, 'db':0, 'da':1, 'cycle':0, 'cycleDelta':0},
		{'stop':255, 'r':0, 'g':0, 'b':100, 'a':255, 'dr':0, 'dg':0, 'db':-1, 'da':1, 'cycle':0, 'cycleDelta':0}
		],
	'earthBeach2':[ // this has been sorted so height goes in the right direction with colour
		{'stop':140, 'r':0, 'g':0, 'b':100, 'a':255, 'dr':0, 'dg':0, 'db':1, 'da':1, 'cycle':0, 'cycleDelta':0}, // Water
		{'stop':150, 'r':255, 'g':255, 'b':0, 'a':255, 'dr':-5, 'dg':-10, 'db':0, 'da':1, 'cycle':0, 'cycleDelta':0}, // beach
		{'stop':230, 'r':0, 'g':200, 'b':0, 'a':255, 'dr':0, 'dg':-1, 'db':0, 'da':1, 'cycle':0, 'cycleDelta':0}, // Earth
		{'stop':250, 'r':100, 'g':100, 'b':100, 'a':255, 'dr':-1, 'dg':-1, 'db':-1, 'da':1, 'cycle':0, 'cycleDelta':0}, // Mountain
		{'stop':255, 'r':250, 'g':250, 'b':250, 'a':255, 'dr':-1, 'dg':-1, 'db':-1, 'da':1, 'cycle':0, 'cycleDelta':0} // snowcap
		],
	'grayScale':[
		{'stop':255, 'r':1, 'g':1, 'b':1, 'a':255, 'dr':1, 'dg':1, 'db':1, 'da':1, 'cycle':0, 'cycleDelta':0}		     
		],
	'redScale':[
		{'stop':255, 'r':1, 'g':0, 'b':0, 'a':255, 'dr':1, 'dg':0, 'db':0, 'da':1, 'cycle':0, 'cycleDelta':0}		     
		],
	'desert':[
		{'stop':50, 'r':1, 'g':1, 'b':1, 'a':255, 'dr':1, 'dg':1, 'db':1, 'da':1, 'cycle':0, 'cycleDelta':0},
		{'stop':220, 'r':100, 'g':100, 'b':0, 'a':255, 'dr':1, 'dg':1, 'db':0, 'da':1, 'cycle':0, 'cycleDelta':0},
		{'stop':255, 'r':0, 'g':0, 'b':200, 'a':255, 'dr':0, 'dg':0, 'db':-1, 'da':1, 'cycle':0, 'cycleDelta':0}
		],
};

// 0.0039 ~ 1/255 - consider making a constant.
var skyFilters = {
	'grayScaleAlpha':[
		{'stop':255, 'r':1, 'g':1, 'b':1, 'a':0, 'dr':1, 'dg':1, 'db':1, 'da':1, 'cycle':1, 'cycleDelta':0}		     
		],
	'grayScaleNoAlpha':[
		{'stop':255, 'r':1, 'g':1, 'b':1, 'a':255, 'dr':1, 'dg':1, 'db':1, 'da':1, 'cycle':0, 'cycleDelta':0}		     
		],
	'yellowScaleAlpha':[
		{'stop':255, 'r':1, 'g':1, 'b':0, 'a':0, 'dr':1, 'dg':1, 'db':0, 'da':1, 'cycle':0, 'cycleDelta':0}		     
		],
};


function TerrainMap(terrainDisplayWidth,terrainDisplayHeight) {
	
	this.terrainDisplayWidth = terrainDisplayWidth;
	this.terrainDisplayHeight = terrainDisplayHeight;
	
	this.terrainMap = this.initaliseTerrainMap();
	this.cloudLayer = this.initaliseTerrainMap();

	this.currentLayer = this.terrainMap;
	
	this.heightMin = 0;
	this.heightMax = 255;
	this.roughness = 0.5;
	
	// We're only interested in capping the range if it goes outside
	// of a RGB value, otherwise we can let them go at it.
	this.hiWater=255;
	this.loWater=0;
	this.range=255;
	this.remapFactor=1; 
}

TerrainMap.prototype.initaliseTerrainMap = function()
{
	var i=0,j=0;
	
	var tempArray = new Array(this.terrainDisplayWidth);
	
	for (i=0;i<this.terrainDisplayWidth;i++)
	{
		tempArray[i] = new Array(this.terrainDisplayHeight);
	}
	
	return(tempArray);
}


TerrainMap.prototype.generateTerrain = function()
{
	var xLen = this.currentLayer.length;
	var yLen = this.currentLayer[0].length;

	var sectorSize = this.terrainDisplayWidth;
	
	// seed the first 4 corners
	this.currentLayer[0][0] = this.setRandomHeight();
	this.currentLayer[xLen-1][yLen-1] = this.setRandomHeight();
	this.currentLayer[xLen-1][0] = this.setRandomHeight();
	this.currentLayer[0][yLen-1] = this.setRandomHeight();
	
	this.refine(xLen,yLen,sectorSize);
}

TerrainMap.prototype.refine = function(xLen,yLen,sectorSize)
{
	var x=0,y=0;
	var xmid=0, ymid=0;
	var average;
	var scale;
	var halfSector;

	for (;sectorSize>=1;sectorSize/=2)
	{
		scale = sectorSize * this.roughness;
		halfSector = sectorSize/2;
		
		for (y=halfSector;y<yLen;y+=sectorSize)
		{
			for (x=halfSector;x<xLen;x+=sectorSize)
			{
				this.calculateSquare(xLen,yLen,x,y,halfSector,scale);
			}
		}
		
		//// diamonds have to overlap by half a sector as the corners "stick out" from the regular
		//// grid.
		for (y=0;y<yLen;y+=halfSector)
		{
			for (x = (y + halfSector) % sectorSize; x <= xLen; x += sectorSize)
			{
				this.calculateDiamond(xLen,yLen,x,y,halfSector,scale);
			}
		}
	}
}

TerrainMap.prototype.calculateSquare = function(xLen,yLen,xmid,ymid,halfSector,scale)
{
	var a,b,c,d;
	var average;
	var adjustment;
	
	// a b
	//  x
	// c d
	a = this.safeGet(xmid-halfSector,ymid-halfSector,xLen,yLen);
	b = this.safeGet(xmid+halfSector,ymid-halfSector,xLen,yLen);
	c = this.safeGet(xmid-halfSector,ymid+halfSector,xLen,yLen);
	d = this.safeGet(xmid+halfSector,ymid+halfSector,xLen,yLen);

	average = this.average(a,b,c,d);
	
	// Can be + or - "scale"
	adjustment = (Math.random() * scale*2) - scale;

	this.safePut(xmid,ymid,xLen,yLen,average+adjustment);
}


TerrainMap.prototype.calculateDiamond = function(xLen,yLen,xmid,ymid,halfSector,scale)
{
	var a=0,b=0,c=0,d=0;
	var average=0;
	var adjustment=0;
	
	//  a
	// bxc
	//  d
	a = this.safeGet(xmid,ymid-halfSector,xLen,yLen);
	b = this.safeGet(xmid-halfSector,ymid,xLen,yLen);
	c = this.safeGet(xmid+halfSector,ymid,xLen,yLen);
	d = this.safeGet(xmid,ymid+halfSector,xLen,yLen);

	average = this.average(a,b,c,d);
	
	// Can be + or - "scale"
	adjustment = (Math.random() * scale*2) - scale;

	this.safePut(xmid,ymid,xLen,yLen,average+adjustment);
}

// This is necessary as some of the squares/diamonds we try to
// check may border on the map and hence have elements outside
// of the map.
TerrainMap.prototype.safeGet = function(x,y, xLen, yLen)
{
	if (x<0)
	{
		x=xLen-1;
	}
	else if (x>=xLen)
	{
		x=0;
	}
	
	if (y<0)
	{
		y=yLen-1;
	}
	else if (y>=yLen)
	{
		y=0;
	}
	
	x=Math.floor(x);
	y=Math.floor(y);
	
	return(this.currentLayer[x][y]);
}

// This is necessary as some of the squares/diamonds we try to
// check may border on the map and hence have elements outside
// of the map.
TerrainMap.prototype.safePut = function(x,y, xLen, yLen,value)
{
	if (x<0)
	{
		x=0;
	}
	else if (x>=xLen)
	{
		x=xLen-1;
	}
	
	if (y<0)
	{
		y=0;
	}
	else if (y>=yLen)
	{
		y=yLen-1;
	}
	
	x=Math.floor(x);
	y=Math.floor(y);
	
	this.currentLayer[x][y]=value;
	
	if (value>this.hiWater)
	{
		this.hiWater=value;
	}
	
	if (value<this.loWater)
	{
		this.loWater=value;
	}
}

TerrainMap.prototype.setRandomHeight = function()
{
	return(Math.random()*this.heightMax);	
}


TerrainMap.prototype.average = function(a,b,c,d)
{
	var validValues=0;
	var runningTotal=0;
	
	if (a>=0)
	{
		runningTotal+=a;
		validValues++;
	}
	
	if (b>=0)
	{
		runningTotal+=b;
		validValues++;
	}

	if (c>=0)
	{
		runningTotal+=c;
		validValues++;
	}

	if (d>=0)
	{
		runningTotal+=d;
		validValues++;
	}
	
	return(validValues>0?runningTotal/validValues:0);
}


// This is just a test function to verify that the array structures
// are all built as expected (lets me verify the basic structure
// of the data storage, display etc prior to debugging the terrain
// generation routine)
TerrainMap.prototype.fillWithNoise = function()
{
	var x, y;
	var xLen,yLen;
	var r,g,b;
	
	xLen = this.currentLayer[0].length;
	yLen = this.currentLayer.length;
	
	for (x=0;x<xLen;x++)
	{
		for (y=0;y<yLen;y++)
		{
			r=Math.floor(Math.random()*255);
			g=Math.floor(Math.random()*255);
			b=Math.floor(Math.random()*255);
			this.currentLayer[x][y]='rgb('+r+','+g+','+b+')';
		}
	}
}

TerrainMap.prototype.drawTerrainMapImageToCanvas = function(originX, originY, targetCanvasCtx, filter)
{
	var terrainImage = targetCanvasCtx.getImageData(originX,originY,this.terrainDisplayWidth,this.terrainDisplayHeight);

	this.drawTerrainMapToImage(terrainImage,this.terrainDisplayWidth,this.terrainDisplayHeight,filter);
	
	targetCanvasCtx.putImageData(terrainImage,originX,originY);
	//targetCanvasCtx.drawImage(terrainImage,originX,originY);
}

TerrainMap.prototype.blendRgba = function(c1,c2)
{
	var r,g,b,a;
	
	var i=0;
	for(i=0;i<4;i++)
	{
		c1[i]/=255;
		c2[i]/=255;
	}
	
	a = c1[3] + c2[3]*(1-c1[3]);

        r = (c1[0] * c1[3]  + c2[0] * c2[3] * (1 - c1[3])) / a;
        g = (c1[1] * c1[3]  + c2[1] * c2[3] * (1 - c1[3])) / a;
        b = (c1[2] * c1[3]  + c2[2] * c2[3] * (1 - c1[3])) / a;
 	
	return([r*255,g*255,b*255,a*255]);
}

TerrainMap.prototype.blendRgba2 = function(c1,c2)
{
	var r,g,b,a;
	
	a = c1[3] + c2[3]*(255-c1[3]);

        r = (c1[0] * c1[3]  + c2[0] * c2[3] * (255 - c1[3])) / a;
        g = (c1[1] * c1[3]  + c2[1] * c2[3] * (255 - c1[3])) / a;
        b = (c1[2] * c1[3]  + c2[2] * c2[3] * (255 - c1[3])) / a;
 	
	return([r,g,b,a]);
}

/* Need to write a hand-blending function, something like this (but using range 255)
 *    var rgbaSum = function(c1, c2){
       var a = c1.a + c2.a*(1-c1.a);
       return {
         r: (c1.r * c1.a  + c2.r * c2.a * (1 - c1.a)) / a,
         g: (c1.g * c1.a  + c2.g * c2.a * (1 - c1.a)) / a,
         b: (c1.b * c1.a  + c2.b * c2.a * (1 - c1.a)) / a,
         a: a
       }
     } 
 */


// This looks like its *almost* working. I need to tinker with the
// sky filters to verify - and maybe change the settings to add
// more cloud. A good way to test the filters is to have an earth
// filter that is pure white, and then I can see if the sky
// clouds over at all.
TerrainMap.prototype.drawTerrainMapToImage = function(image, xLen, yLen, filter)
{	
	var x, y;
	var raw;
	var rgba = [];
	var tempArray = [0,0,0,0];
		
	this.setRange();
	
	for (y=0;y<yLen;y++)
	{
		for (x=0;x<xLen;x++)
		{
			raw = this.remapRaw(this.currentLayer[x][y]);
			
			// Get the value from the filter we want to apply to the image
			rgba=this.getFilterScale(filter,raw);
			
			// Get the original value from the image
			tempArray[0]=image.data[(y*(xLen*4))+(x*4)];
			tempArray[1]=image.data[(y*(xLen*4))+(x*4)+1];
			tempArray[2]=image.data[(y*(xLen*4))+(x*4)+2];
			tempArray[3]=image.data[(y*(xLen*4))+(x*4)+3];
			
			// blend them together
			tempArray = this.blendRgba(rgba,tempArray);
			
			// Write the new blended value to the image
			image.data[(y*(xLen*4))+(x*4)]=tempArray[0];
			image.data[(y*(xLen*4))+(x*4)+1]=tempArray[1];
			image.data[(y*(xLen*4))+(x*4)+2]=tempArray[2];
			image.data[(y*(xLen*4))+(x*4)+3]=tempArray[3];
		}
	}
	console.log("Range:"+this.loWater+","+this.hiWater);
	
	return(image);
}


TerrainMap.prototype.drawTerrainMapDirectToCanvas = function(targetCanvasCtx, filter)
{	
	var x, y;
	var xLen,yLen;
	var raw;
	var style;
	
	xLen = this.currentLayer[0].length;
	yLen = this.currentLayer.length;
	
	this.setRange();
	
	for (x=0;x<xLen;x++)
	{
		for (y=0;y<yLen;y++)
		{
			raw = this.remapRaw(this.currentLayer[x][y]);
			
			style=this.getFilterScaleRGBA(filter,raw);
			targetCanvasCtx.fillStyle=style;
			
			targetCanvasCtx.fillRect(x,y,1,1);
		}
	}
	console.log("Range:"+this.loWater+","+this.hiWater);
}

TerrainMap.prototype.getFilterScaleRGBA = function(filter,raw)
{

	var rgba = this.getFilterScale(filter,raw);
	return('rgba('+rgba[0]+','+rgba[1]+','+rgba[2]+','+rgba[3]+')');
}

TerrainMap.prototype.getFilterScale = function(filter,raw)
{
	var i=0;
	var filterStops = filter.length;
	var r,g,b,a;
	var previousStop=0;
	var subRaw=0;
	
	// Simply loop through the filter stops looking
	// for one that is appropriate for this raw value
	for (i=0;i<filter.length;i++)
	{
		if (raw <filter[i].stop)
		{
			// How far are we through the band?
			subRaw = raw - previousStop;

			r = (filter[i].dr<0)?(filter[i].r-(subRaw*Math.abs(filter[i].dr))):(subRaw*Math.abs(filter[i].dr)+filter[i].r);
			g = (filter[i].dg<0)?(filter[i].g-(subRaw*Math.abs(filter[i].dg))):(subRaw*Math.abs(filter[i].dg)+filter[i].g);
			b = (filter[i].db<0)?(filter[i].b-(subRaw*Math.abs(filter[i].db))):(subRaw*Math.abs(filter[i].db)+filter[i].b);
			
			a = (filter[i].da<0)?(filter[i].a-(subRaw*Math.abs(filter[i].da))):(subRaw*Math.abs(filter[i].da)+filter[i].a);

			if (filter[i].cycle==1)
			{
				a+=filter[i].cycleDelta;
				
				if (a>255)
				{
					a-=255;
				}
			}

			return([r,g,b,a]);
		}
		previousStop = filter[i].stop;
	}
	
	// If we ever get a value outside of filter ranges, just return "transparent black"
	return([0,0,0,0]);
}


TerrainMap.prototype.remapRaw = function(raw)
{
	//re-zero the range
	raw -= this.loWater;
	
	raw = Math.floor(raw/this.remapFactor);
	
	return(raw);
}

TerrainMap.prototype.setRange = function()
{
	this.range = this.hiWater - this.loWater;
	
	// We create a remap factor if the range is
	// longer than 255 and we need to compress
	// the range back to within 255 range
	// otherwise we leave it defaulted to 1
	// which means the value will not be
	// altered
	if (this.range>255)
	{
		this.remapFactor = this.range/255;
	}	
}

TerrainMap.prototype.clearCanvas = function(targetCanvas,targetCanvasCtx)
{	
	var width = targetCanvas.width;
	var height = targetCanvas.height;
	
	// Clear the screen, ready for the next frame
	targetCanvasCtx.fillStyle='blue';
	targetCanvasCtx.fillRect(0,0,width,height); // clear canvas
}
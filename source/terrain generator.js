// This code provides a top level entry point and sample framework
// for testing out the terrain generator.

// Display areas
var primaryCanvas = document.getElementById('primaryPanel');
var primaryCanvasCtx;

var tDisplayWidth = 500;
var tDisplayHeight = 500;

var myTMDW1, myTMDW2;

var cyleDirection = 1;
var floodTime = 0;

// Populate the drop down objects on the display so that the user can
// select what filters to use on the map
function populateFilterSelector(selector,filter) {
	var i=0, len=0;
	
	var objectProperties=Object.getOwnPropertyNames(filter);
	
	len = objectProperties.length;

	for(i=0;i<len;i++)
	{	
		selector.options[selector.options.length] = new Option(objectProperties[i], i+1);
	}
}

// Initial entry point for the code, builds all the UI and kicks
// off the call to the generateMaps() function to actually do the work
function init()
{
	
	var selectedOption;
	var terrainTextOption;
	var skyTextOption;
	
	// Set up the references to the display
	primaryCanvas = document.getElementById('primaryPanel');
	primaryCanvasCtx = primaryCanvas.getContext('2d');
	tDisplayWidth = primaryCanvas.width/2; // place 2 planets side by side
	tDisplayHeight = primaryCanvas.height;
	
	// Set up and default the selectors
	populateFilterSelector(document.getElementById("skyFilterSelector"),skyFilters);
	populateFilterSelector(document.getElementById("terrainFilterSelector"),terrainFilters);
	document.getElementById("skyFilterSelector").value=1;	
	document.getElementById("terrainFilterSelector").value=3;	

	generateMaps();
}

function generateMaps() {

	initaliseMaps();

	drawLayers();

	restoreImages();
}

function restoreImages() {
	
	// OK now draw the images onto the actual display
	myTMDW1.restoreImage();
	myTMDW2.restoreImage();	
}

function drawLayers() {	

	// discover the filters selected from the drop downs...
	selectedOption = document.getElementById("terrainFilterSelector");
	terrainTextOption = selectedOption.options[selectedOption.selectedIndex].text;

	selectedOption = document.getElementById("skyFilterSelector");
	skyTextOption = selectedOption.options[selectedOption.selectedIndex].text;

	// Draw the Western Hemisphere	
	myTMDW1.drawLayer(myTMDW1.myMap.terrainMap,terrainFilters[terrainTextOption]);
	myTMDW1.drawLayer(myTMDW1.myMap.cloudLayer,skyFilters[skyTextOption]);
	
	myTMDW1.addPlanetFilter();
	myTMDW1.saveImage();

	
	// Draw the Eastern Hemisphere
	myTMDW2.drawLayer(myTMDW2.myMap.terrainMap,terrainFilters[terrainTextOption]);	
	myTMDW2.drawLayer(myTMDW2.myMap.cloudLayer,skyFilters[skyTextOption]);
	
	myTMDW2.addPlanetFilter();
	myTMDW2.saveImage();
}
	

function initaliseMaps()
{
	// Init the display wrapper
	myTMDW1 = new TerrainMapDisplayWrapper(primaryCanvasCtx,0,0,tDisplayWidth,tDisplayHeight);
	myTMDW2 = new TerrainMapDisplayWrapper(primaryCanvasCtx,tDisplayWidth,0,tDisplayWidth,tDisplayHeight);

	// Clear the entire canvas - we only need to call this on one of the TM display wrappers
	// as the parameters clear the entire area.
	myTMDW1.myMap.clearCanvas(primaryCanvas,primaryCanvasCtx);
}

// This is just a mock up to test the concept. The below code changes the raw filter values (we need a way to
// re-initalise them, otherwise they stay changed for the duration of the script run). 

function stepFilter() {
	var i=0;
	
	selectedOption = document.getElementById("terrainFilterSelector");
	terrainTextOption = selectedOption.options[selectedOption.selectedIndex].text;
	
	if (floodTime)
	{
		// This is hard coded to 2 at the moment so that we dont erase mountains when
		// flooding - this is a hack. needs fixing.
		for (i=0;i<2 && i<terrainFilters[terrainTextOption].length;i++)
		{
			terrainFilters[terrainTextOption][i].stop+=1;
			if (terrainFilters[terrainTextOption][i].stop>255)
			{
				terrainFilters[terrainTextOption][i].stop=255;
			}
		}
	}
	
	selectedOption = document.getElementById("skyFilterSelector");
	skyTextOption = selectedOption.options[selectedOption.selectedIndex].text;

	// this cycleDelta stuff isnt working properly yet - some code here and some
	// in TerrainMap getFilterScale()	
	if (cyleDirection)
	{
		skyFilters[skyTextOption][0].cycleDelta+=5;
		if (skyFilters[skyTextOption][0].cycleDelta>255) {
			//skyFilters[skyTextOption][0].cycleDelta=255;
			cyleDirection=!cyleDirection;
		}
	}
	else
	{
		skyFilters[skyTextOption][0].cycleDelta-=5;
		if (skyFilters[skyTextOption][0].cycleDelta<0) {
			//skyFilters[skyTextOption][0].cycleDelta=0;
			cyleDirection=!cyleDirection;
		}	
	}
	drawLayers();

	restoreImages();
}

function runFilter()
{
		setInterval(stepFilter,200);
}

function runFloodTime()
{
		floodTime=1;
}
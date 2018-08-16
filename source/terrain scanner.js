// This code provides a top level entry point and sample framework
// for testing out the terrain scanner.

// Display areas
var primaryCanvas = document.getElementById('primaryPanel');
var primaryCanvasCtx;

var myTMDW;

var areaScanner = new AreaScanner();

// Initial entry point for the code, builds all the UI and kicks
// off the call to the generateMaps() function to actually do the work
function init()
{
	// Set up the references to the display
	primaryCanvas = document.getElementById('primaryPanel');
	primaryCanvasCtx = primaryCanvas.getContext('2d');
        
	// Init the display wrapper (width,height)
	myTMDW = new TerrainMapDisplayWrapper(primaryCanvasCtx,0,0,primaryCanvas.width,primaryCanvas.height);
	//myTMDW = new TerrainMapDisplayWrapper(primaryCanvasCtx,0,0,500,500);

        
	// Clear the entire canvas - we only need to call this on one of the TM display wrappers
	// as the parameters clear the entire area.
	myTMDW.myMap.clearCanvas(primaryCanvas,primaryCanvasCtx);

	myTMDW.drawLayer(myTMDW.myMap.terrainMap,terrainFilters['earthBeach2']);
	
	myTMDW.saveImage();

	myTMDW.restoreImage();
	
	areaScanner.checkArea(0,0,primaryCanvas.width-1,primaryCanvas.height-1,primaryCanvasCtx,0);
}

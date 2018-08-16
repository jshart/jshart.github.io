function AreaScanner() {
}

AreaScanner.prototype.checkArea = function(startX,startY,endX,endY,canvas,depthGuard)
{
    var areaIsGood = true;
    var x1=0,x2=0,y1=0,y2=0;
    var xDiff=0, yDiff=0;

    depthGuard++;
    
    if (depthGuard>9) {
        return;
    }
    
    
    // Work out the half way points, so we can divide the square
    // into 4 quaters.
    xDiff = (endX - startX)/2;
    yDiff = (endY - startY)/2;
    
    // Check the 4 corners of this box to see if the area is all inside
    // "land" or if any corners are in the sea.
    
    if (this.checkPixelIsBlue(startX,startY,canvas)) {
        // blue (aka "sea") found, make the area as bad as it overlaps
        // and isnt pure land
        areaIsGood = false;
    }

    if (areaIsGood && this.checkPixelIsBlue(startX,endY,canvas)) {
        // blue (aka "sea") found, make the area as bad as it overlaps
        // and isnt pure land
        areaIsGood = false;
    }
        
    if (areaIsGood && this.checkPixelIsBlue(endX,startY,canvas)) {
        // blue (aka "sea") found, make the area as bad as it overlaps
        // and isnt pure land
        areaIsGood = false;
    }
    
    if (areaIsGood && this.checkPixelIsBlue(endX,endY,canvas)) {
        // blue (aka "sea") found, make the area as bad as it overlaps
        // and isnt pure land
        areaIsGood = false;
    }

    
 /*   if (areaIsGood && this.checkPixelIsBlue(startX+xDiff,endX+yDiff,canvas)) {
        // blue (aka "sea") found, make the area as bad as it overlaps
        // and isnt pure land
        areaIsGood = false;
    }

    if (areaIsGood && this.checkPixelIsBlue(startX+xDiff,startY,canvas)) {
        // blue (aka "sea") found, make the area as bad as it overlaps
        // and isnt pure land
        areaIsGood = false;
    }

    if (areaIsGood && this.checkPixelIsBlue(startX+xDiff,endY,canvas)) {
        // blue (aka "sea") found, make the area as bad as it overlaps
        // and isnt pure land
        areaIsGood = false;
    }

    if (areaIsGood && this.checkPixelIsBlue(startX,startY+yDiff,canvas)) {
        // blue (aka "sea") found, make the area as bad as it overlaps
        // and isnt pure land
        areaIsGood = false;
    }

    if (areaIsGood && this.checkPixelIsBlue(endX,startY+yDiff,canvas)) {
        // blue (aka "sea") found, make the area as bad as it overlaps
        // and isnt pure land
        areaIsGood = false;
    }*/
    
    
    if (areaIsGood)
    {
        // Draw the box
        canvas.strokeStyle='red';
	canvas.fillStyle='red';				
	canvas.strokeRect(startX,startY,endX-startX,endY-startY);
    }
    else
    {
        // Only bother searching the next level down if the squares we'd
        // create are at least more than a pixel in size... otherwise
        // we've hit the limits of our granularity, so quit the recursion
        // and head back up the stack.
        if (endX>startX+4 && endY>startY+4)
        {   
            // Check each of the corners...
            x1=startX;
            y1=startY;
            x2=startX+xDiff;
            y2=startY+yDiff;
            
            this.checkArea(x1,y1,x2,y2,canvas,depthGuard);
            
            x1=startX+xDiff;
            y1=startY;
            x2=endX;
            y2=startY+yDiff;
            
            this.checkArea(x1,y1,x2,y2,canvas,depthGuard);            

            x1=startX;
            y1=startY+yDiff;
            x2=startX+xDiff;
            y2=endY;
            
            this.checkArea(x1,y1,x2,y2,canvas,depthGuard);
            
            
            x1=startX+xDiff;
            y1=startY+yDiff;
            x2=endX;
            y2=endY;
            
            this.checkArea(x1,y1,x2,y2,canvas,depthGuard);            
        }
    }
}

AreaScanner.prototype.checkPixelIsBlue = function(x,y,canvas)
{
    var pixelData = canvas.getImageData(x, y, 1, 1).data;
    
    // Hard code for now - but probably ultimately need to pass
    // this in as parameters.
    // For now we're just hard coding the check to blue
    if (pixelData[2]>0)
    {
        return(true);
    }
    return(false);
}
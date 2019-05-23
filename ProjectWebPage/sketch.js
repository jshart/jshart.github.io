let maxSnowFlakes=20;
let maxBuildings=15;

class SnowLevel {

  constructor(w)
  {
    this.snowLevels=[];
    this.buildingLevels=[];

    let a=0;
    for (a=0;a<w;a++)
    {
      this.snowLevels[a]=0;
      this.buildingLevels[a]=0;
    }
  }

  snowStartPoint(i)
  {
    return(this.buildingLevels[i]+this.snowLevels[i]);
  }

  snowEndPoint(i)
  {
    return(this.buildingLevels[i]);
  }

  addSnow(xpos,amount)
  {
    let i=0;
    let a=amount;
    for (i=xpos;i>=0 && a>=0;i--)
    {
      this.snowLevels[i]+=a;
      a--;
    }

    a=amount-1;
    for (i=xpos+1;i<width && a>=0;i++)
    {
      this.snowLevels[i]+=a;
      a--;
    }
  }

  driftSnow(mx,x)
  {
    let dFactor=5;

    if (this.snowLevels[x]<=dFactor)
    {
      return;
    }

    if (mx > x)
    {
      // push snow to the left
      if (x>0)
      {
        if (this.snowStartPoint(x) > this.snowStartPoint(x-1)+dFactor)
        {
          this.snowLevels[x]--;
          this.snowLevels[x-1]++;
        }
      }
    }
    else
    {
      // push snow to the right
      if (x<width)
      {
        if (this.snowStartPoint(x) > this.snowStartPoint(x+1)+dFactor)
        {
          this.snowLevels[x]--;
          this.snowLevels[x+1]++;
        }
      }
    }
  }

  updatebuildingLevels(b)
  {
    let i=0;
    let bi=0;
    for (i=0;i<b.width;i++)
    {
      bi = b.x+i;

      this.buildingLevels[bi]=this.buildingLevels[bi]>b.height?this.buildingLevels[bi]:b.height;
    }
  }
}

class Building {
  constructor(xpos, w, h)
  {
    this.x=xpos;
    this.width = w;
    this.height = h;
  }

  draw()
  {
    rect(this.x,height-this.height,this.width,this.height)
  }
}

class Snowflake {
  constructor(xp,yp,sp,sz)
  {
    this.x=xp;
    this.y=yp;
    this.speed=sp;
    this.size=sz
  }

  update(xd,yd)
  {
    this.x+=xd;
    this.y+=yd;
  }

  reboot()
  {
    this.y=0;
    this.x=floor(random(0,width));
  }

  draw()
  {
    ellipse(this.x,this.y,this.size,this.size);
  }
}

let snowFlakes=[];
let buildings=[];
let snowLevel;
let maxDist;

function setup() {
  createCanvas(500,500);

  snowLevel = new SnowLevel(width);

  maxDist = floor(sqrt((width*width) + (height*height)))

  let a=0;
  for (a=0;a<maxSnowFlakes;a++)
  {
    snowFlakes[a]= new Snowflake(floor(random(0,width)),0,random(1,3),random(1,7));
  }

  for (a=0;a<maxBuildings;a++)
  {
    buildings[a]= new Building(floor(random(0,width)),floor(random(10,80)),floor(random(10,80)));
    snowLevel.updatebuildingLevels(buildings[a]);
  }
}

function mousePressed()
{

}

function draw() {
    background(0);
    stroke(255);
    noFill();

    ellipse(mouseX,mouseY,10,10);

    //let xdelta = floor((mouseX - (width/2))/10);

    let a=0;
    let resetFlake=false;
    let ydelta = 0;
    let xdelta = 0;
    let delta = 0;

    for (a=0;a<snowFlakes.length;a++)
    {
      resetFlake=false;

      // calculate the linear distance between each snowflake and the mouse
      xdelta = mouseX-snowFlakes[a].x;
      ydelta = mouseY-snowFlakes[a].y;
      delta = sqrt((xdelta*xdelta)+(ydelta*ydelta));

      // 200 is a magic number - this scales the "wind" force, maybe make this adjustable
      // somehow
      delta=floor((maxDist-delta)/200);

      // Move the snow
      snowFlakes[a].update((mouseX>(snowFlakes[a].x))?-delta:delta,snowFlakes[a].speed)

      // snow is off screen set to reset
      if (snowFlakes[a].x<0 || snowFlakes[a].x>width)
      {
        resetFlake=true;
      }
      else
      {
        // attempt to draw the snow
        snowFlakes[a].draw();

        // If the snow hits the pile at the bottom
        // then add snow to the pile
        if (snowFlakes[a].y>(height-snowLevel.snowStartPoint(snowFlakes[a].x)))
        {
          snowLevel.addSnow(floor(snowFlakes[a].x),floor(snowFlakes[a].size));
          resetFlake=true;
        }
      }

      // if this snowflake is finished width
      // reuse it by repositioning it at a
      // random location at the top of the screen.
      if (resetFlake==true)
      {
        //console.log("resetFlake:"+snowX[a]+","+snowY[a]);
        snowFlakes[a].reboot()
      }
    }

    for (a=0;a<buildings.length;a++)
    {
      buildings[a].draw();
    }

    // draw all the snow at the bottom
    for (a=0;a<width;a++)
    {
      snowLevel.driftSnow(mouseX,a);
      line(a,height-snowLevel.snowStartPoint(a),a,height-snowLevel.snowEndPoint(a));
    }
}

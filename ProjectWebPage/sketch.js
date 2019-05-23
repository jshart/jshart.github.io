let maxSnowFlakes=20;
let maxBuildings=10;

let snowLevel=[];

class SnowLevel {
  constructor(w)
  {
    let snowLevel=[];
    let buildingLevel=[];

    for (a=0;a<w;a++)
    {
      snowLevel[a]=0;
      buildingLevel[a]=0;
    }
  }

  updateBuildingLevel(b)
  {
    let i=0;
    for (i=0;i<b.width;i++)
    {
      buildingLevel[b.x+i]=b.h;
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

function setup() {
  createCanvas(500,500);

  let a=0;
  for (a=0;a<maxSnowFlakes;a++)
  {
    snowFlakes[a]= new Snowflake(floor(random(0,width)),0,random(1,3),random(1,7));
  }

  for (a=0;a<width;a++)
  {
    snowLevel[a]=0;
  }

  for (a=0;a<maxBuildings;a++)
  {
    buildings[a]= new Building(floor(random(0,width)),floor(random(10,50)),floor(random(10,50)));
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

      // TODO 500 is approx max distance, need to actually calculate this in setup()
      // 200 is a magic number - this scales the "wind" force, maybe make this adjustable
      // somehow
      delta=floor((500-delta)/200);

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
        if (snowFlakes[a].y>(height-snowLevel[snowFlakes[a].x]))
        {
          snowLevel[snowFlakes[a].x]+=3;

          if (snowFlakes[a].x>1)
          {
            snowLevel[snowFlakes[a].x-1]+=2;
            snowLevel[snowFlakes[a].x-2]++;
          }
          if (snowFlakes[a].x<width-1)
          {
            snowLevel[snowFlakes[a].x+1]+=2;
            snowLevel[snowFlakes[a].x+2]++;
          }

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
      line(a,height-snowLevel[a],a,height);
    }

}

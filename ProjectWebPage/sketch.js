let maxDrops=20;

let snowLevel=[];

let yellowSnow=false;

class Snowflake {
  constructor(xp,yp,sp)
  {
    this.x=xp;
    this.y=yp;
    this.speed=sp;
  }
}

let snowFlakes=[];

function setup() {
  createCanvas(500,500);

  let a=0;
  for (a=0;a<maxDrops;a++)
  {
    snowFlakes[a]= new Snowflake(floor(random(0,width)),0,random(1,3));
  }

  for (a=0;a<width;a++)
  {
    snowLevel[a]=0;
  }
}

function mousePressed()
{
  if (yellowSnow==false)
  {
    yellowSnow=true;
  }
  else {
    yellowSnow=false;
  }
}

function draw() {
    background(0);
    stroke(255);

    let c = color(255, 204, 0)

    if (yellowSnow==true)
    {
      fill(c);
      stroke(c);
    }
    else {
      noFill();
      stroke(255);
    }
    ellipse(mouseX,mouseY,10,10);

    //let xdelta = floor((mouseX - (width/2))/10);

    let a=0;
    let resetSnow=false;
    let ydelta = 0;
    let xdelta = 0;
    let delta = 0;
    for (a=0;a<maxDrops;a++)
    {
      resetSnow=false;

      // calculate the linear distance between each snowflake and the mouse
      xdelta = mouseX-snowFlakes[a].x;
      ydelta = mouseY-snowFlakes[a].y;
      delta = sqrt((xdelta*xdelta)+(ydelta*ydelta));
      delta=floor((500-delta)/100);

      // Move the snow
      snowFlakes[a].y+=snowFlakes[a].speed;
      snowFlakes[a].x+=(mouseX>(snowFlakes[a].x))?-delta:delta;

      // snow is off screen set to reset
      if (snowFlakes[a].x<0 || snowFlakes[a].x>width)
      {
        resetSnow=true;
      }
      else
      {
        // attempt to draw the snow
        ellipse(snowFlakes[a].x,snowFlakes[a].y,5,5);

        // If the snow hits the pile at the bottom
        // then add snow to the pile
        if (snowFlakes[a].y>(height-snowLevel[snowFlakes[a].x]))
        //if (snowY[a]>(height))
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

          resetSnow=true;
        }
      }

      // if this snowflake is finished width
      // reuse it by repositioning it at a
      // random location at the top of the screen.
      if (resetSnow==true)
      {
        //console.log("resetSnow:"+snowX[a]+","+snowY[a]);
        snowFlakes[a].y=0;
        snowFlakes[a].x=floor(random(0,width));
      }
    }

    // draw all the snow at the bottom
    for (a=0;a<width;a++)
    {
      line(a,height-snowLevel[a],a,height);
    }
}

let snowX=[];
let snowY=[];
let snowSpeed=[];

let maxDrops=20;

let snowLevel=[];

let yellowSnow=false;

function setup() {
  createCanvas(500,500);

  let a=0;
  for (a=0;a<maxDrops;a++)
  {
    snowX[a]=floor(random(0,width));
    snowY[a]=0;
    snowSpeed[a]=random(1,3);
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
      xdelta = mouseX -snowX[a];
      ydelta = mouseY -snowY[a];
      delta = sqrt((xdelta*xdelta)+(ydelta*ydelta));
      delta=floor((500-delta)/100);

      // Move the snow
      snowY[a]+=snowSpeed[a];
      snowX[a]+=(mouseX>(snowX[a]))?-delta:delta;

      // snow is off screen set to reset
      if (snowX[a]<0 || snowX[a]>width)
      {
        resetSnow=true;
      }
      else
      {
        // attempt to draw the snow
        ellipse(snowX[a],snowY[a],5,5);

        // If the snow hits the pile at the bottom
        // then add snow to the pile
        if (snowY[a]>(height-snowLevel[snowX[a]]))
        //if (snowY[a]>(height))
        {
          snowLevel[snowX[a]]+=3;

          if (snowX[a]>1)
          {
            snowLevel[snowX[a]-1]+=2;
            snowLevel[snowX[a]-2]++;
          }
          if (snowX[a]<width-1)
          {
            snowLevel[snowX[a]+1]+=2;
            snowLevel[snowX[a]+2]++;
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
        snowY[a]=0;
        snowX[a]=floor(random(0,width));
      }
    }

    // draw all the snow at the bottom
    for (a=0;a<width;a++)
    {
      line(a,height-snowLevel[a],a,height);
    }
}

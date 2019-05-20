let snowX=[];
let snowY=[];
let snowSpeed=[];

let maxDrops=20;

let snowLevel=[];

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

function draw() {
    background(255);
    ellipse(mouseX,mouseY,10,10);

    let a=0;
    for (a=0;a<maxDrops;a++)
    {
      ellipse(snowX[a],snowY[a],5,5);
      snowY[a]+=snowSpeed[a];

      if (snowY[a]>(height-snowLevel[snowX[a]]))
      //if (snowY[a]>(height))
      {
        snowLevel[snowX[a]]+=2;

        if (snowX[a]>0)
        {
          snowLevel[snowX[a]-1]++;
        }
        if (snowX[a]<width)
        {
          snowLevel[snowX[a]+1]++;
        }

        snowY[a]=0;
        snowX[a]=floor(random(0,width));
      }
    }

    for (a=0;a<width;a++)
    {
      line(a,height-snowLevel[a],a,height);
    }
}

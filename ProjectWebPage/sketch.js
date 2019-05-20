let rainX=[];
let rainY=[];
let rainSpeed=[];

function setup() {
  createCanvas(500,500);

  let a=0;
  for (a=0;a<10;a++)
  {
    rainX[a]=random(0,width);
    rainY[a]=0;
    rainSpeed[a]=random(1,3);
  }
}

function draw() {
    background(255);
    ellipse(mouseX,mouseY,10,10);

    let a=0;
    for (a=0;a<10;a++)
    {
      ellipse(rainX[a],rainY[a],5,5);
      rainY[a]+=rainSpeed[a];

      if (rainY[a]>height)
      {
        rainY[a]=0;
        rainX[a]=random(0,width);
      }
    }
}

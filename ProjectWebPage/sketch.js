function setup() {
  createCanvas(500,500);
}

function draw() {
  for (a=0;a<100;a++)
  {
    ellipse(50+a,50+a,10,10+a);
  }
}

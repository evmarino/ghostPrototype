// cemeteryLevel.js

let graves = [];          
let cemeteryOrbs = [];    
let orbsFound = 0;

class CemeteryOrb {
  constructor(x, y, c) {
    this.x = x;
    this.y = y;
    this.r = 16;
    this.c = c;
    this.collected = false;

    this.dir = random(0, Math.PI);
    this.speed = 100;
    this.stateTime = 0;
  }

  draw() {
    if (this.collected) return;

    const dt = deltaTime / 1000.0;

    this.dir = 0;
    this.stateTime -= dt;

    if (this.stateTime <= 0) {
      this.stateTime = random(0.25, 1);
      this.dir = Math.min(Math.max(this.dir + random(-0.1, 0.1), 0), Math.PI);
      this.speed = random(100, 300);
    }

    this.x = Math.cos(this.dir) * (this.speed * dt);
    this.y = Math.sin(this.dir) * (this.speed * dt);

    noStroke();
    fill(this.c);
    circle(this.x, this.y, this.r * 2);

    fill(255, 240);
    circle(this.x - this.r / 3, this.y - this.r / 3, this.r / 2);
  }

  tryCollect(px, py) {
    if (this.collected) return false;
    const d = dist(px, py, this.x, this.y);
    if (d < this.r + 20) {  
      this.collected = true;
      return true;
    }
    return false;
  }
}
function startCemeteryLevel() {
  GAME_STATE = "CEMETERY";

  graves = [];
  cemeteryOrbs = [];
  orbsFound = 0;

  ghostX = width * 0.5;
  ghostY = height * 0.7;
  isMoving = false;
  isScaring = false;

  // five colored orbs
  const colorData = [
    { label: "Rivera",    col: color( 80, 170, 255) }, // blue
    { label: "Nguyen",    col: color(255, 230, 100) }, // yellow
    { label: "Martinez",  col: color(120, 220, 140) }, // green
    { label: "Patel",     col: color(255, 160,  70) }, // orange
    { label: "Kaur",      col: color(255, 140, 210) }  // pink
  ];

  const startY = height / 2 - 100;
  const nameX  = width * 0.16;
  for (let i = 0; i < colorData.length; i++) {
    graves.push({
      name: colorData[i].label,
      col: colorData[i].col,
      x: nameX,
      y: startY + i * 40
    });
  }

  const orbPositions = [
    { xf: 0.45, yf: 0.35 },
    { xf: 0.70, yf: 0.28 },
    { xf: 0.82, yf: 0.55 },
    { xf: 0.55, yf: 0.72 },
    { xf: 0.30, yf: 0.60 }
  ];

  for (let i = 0; i < colorData.length; i++) {
    const p = orbPositions[i];
    const x = p.xf * width;
    const y = p.yf * height;
    cemeteryOrbs.push(new CemeteryOrb(x, y, colorData[i].col));
  }
}

function drawCemeteryLevel() {

  if (typeof menuBg !== "undefined") {
    image(menuBg, width / 2, height / 2, width, height);
  } else {
    background(10, 10, 20);
  }

  noStroke();
  fill(0, 0, 0, 160);
  rect(0, 0, width, height);


  moveGhost();
  drawGhost();


  fill(255);
  textAlign(LEFT, TOP);
  textSize(28);
  text("Level 2: Lay the souls to rest", 40, 30);


  textSize(22);
  for (let g of graves) {
    fill(g.col);
    text(g.name, g.x, g.y);
  }

  
  for (let orb of cemeteryOrbs) {
    orb.draw();
    if (orb.tryCollect(ghostX, ghostY)) {
      orbsFound++;
    }
  }

  fill(255);
  textSize(16);
  text(
    `Souls reclaimed in the cemetery: ${orbsFound} / ${cemeteryOrbs.length}`,
    40,
    height - 80
  );

  text(
    "Float around the graves and collect each colored soul orb.\n(Basic collect-on-touch for now — later we can match them to the names.)",
    40,
    height - 50
  );
}

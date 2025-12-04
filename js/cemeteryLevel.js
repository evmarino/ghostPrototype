// cemeteryLevel.js 

let graves = [];          
let cemeteryOrbs = [];    
let matchOrbs = [];      
let cemeteryStage = "EXPLORE";

let orbsFound = 0;
let matchesMade = 0;
let cemIsBW = false;


let draggingOrb = null;
let dragStartX = 0;
let dragStartY = 0;

let connections = []; 

// black & white effect for matching
let bwActive = false;
let bwTimer = 0;
let bwCooldown = 0;
const BW_INTERVAL = 5;   // seconds between flickers
const BW_DURATION = 3;    // seconds in grayscale

class CemeteryOrb {
  constructor(x, y, img, c) {
    this.x = x;
    this.y = y;
    this.r = 16;
    this.img = img;
    this.c = c;
    this.collected = false;

    this.dir = random(0, Math.PI);
    this.targetDir = 0;
    this.speed = 0;
    this.stateTime = 0;
  }

  draw() {
    if (this.collected) return;

    const dt = deltaTime / 1000.0;
    this.stateTime -= dt;

    if (this.stateTime <= 0) {
      this.stateTime = random(2, 5);
      this.targetDir = (this.dir + random(-Math.PI, Math.PI)) % (2 * Math.PI);
      this.speed = random(100, 150);
    }

    const MAX_STEP = 0.02;
    let diff = ((this.targetDir - this.dir + Math.PI) % (2 * Math.PI)) - Math.PI;

    if (diff > MAX_STEP) diff = MAX_STEP;
    if (diff < -MAX_STEP) diff = -MAX_STEP;

    this.dir += diff;

    this.x += Math.cos(this.dir) * this.speed * dt;
    this.y += Math.sin(this.dir) * this.speed * dt;

    if (this.x <= 50) {
      this.x = 50;
      this.targetDir = (Math.PI - this.dir) % (2 * Math.PI);
      this.dir = this.targetDir;
      this.stateTime = 2;
    } else if (this.x >= width - 50) {
      this.x = width - 50;
      this.targetDir = (Math.PI - this.dir) % (2 * Math.PI);
      this.dir = this.targetDir;
      this.stateTime = 2;
    } else if (this.y <= 50) {
      this.y = 50;
      this.targetDir = (-this.dir) % (2 * Math.PI);
      this.dir = this.targetDir;
      this.stateTime = 2;
    } else if (this.y >= height - 50) {
      this.y = height - 50;
      this.targetDir = (-this.dir) % (2 * Math.PI);
      this.dir = this.targetDir;
      this.stateTime = 2;
    }

    imageMode(CENTER);
    if (cemIsBW) {
      tint(200);   // grayscale tint
    } else {
      noTint();
    }
    image(this.img, this.x, this.y, this.r*4, this.r*4);
    noTint();

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

class MatchOrb {
  constructor(x, y, img, c) {
    this.x = x;
    this.y = y;
    this.r = 16;
    this.img = img;
    this.c = c;
    this.matched = false;
  }

  
  draw() {
    if (this.matched) return;
    
    imageMode(CENTER);
    if (cemIsBW) tint(200); else noTint();
    image(this.img, this.x, this.y, this.r*4, this.r*4);
    noTint();
  }
}

// shuffle help func.
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = floor(random(i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function startCemeteryLevel() {
  GAME_STATE = "CEMETERY";

  graves = [];
  cemeteryOrbs = [];
  matchOrbs = [];
  connections = [];
  cemeteryStage = "EXPLORE";

  orbsFound = 0;
  matchesMade = 0;

  bwActive = false;
  bwTimer = 0;
  bwCooldown = 0;
  cemIsBW = false;

  ghostX = width * 0.5;
  ghostY = height * 0.7;
  isMoving = false;
  isScaring = false;

//COLOR LAST NAMES 
const colorData = [
  { label: "Rivera",   col: color( 80, 170, 255), img: blueSoul   }, // blue
  { label: "Nguyen",   col: color(255, 230, 100), img: yellowSoul }, // yellow
  { label: "Martinez", col: color(120, 220, 140), img: greenSoul  }, // green
  { label: "Patel",    col: color(255, 160,  70), img: orangeSoul }, // orange
  { label: "Kaur",     col: color(255, 140, 210), img: pinkSoul   }  // pink
];

  const startY = height / 2 - 100;
  const nameX  = width * 0.16;
  for (let i = 0; i < colorData.length; i++) {
    graves.push({
      name: colorData[i].label,
      col: colorData[i].col,
      x: nameX,
      y: startY + i * 40,
      matched: false
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
    cemeteryOrbs.push(new CemeteryOrb(x, y, colorData[i].img, colorData[i].col)); 
  }

  // MATCHinng phase orbs on right, shuffled so colors don't line up with names
  const orbColors = [...colorData];   
  shuffleArray(orbColors);

  const matchStartX = width * 0.70;
  const matchStartY = height / 2 - 100;
  for (let i = 0; i < orbColors.length; i++) {
    matchOrbs.push(
      new MatchOrb(
        matchStartX,
        matchStartY + i * 40,
        orbColors[i].img,  // the image!
        orbColors[i].col   // the color
      )
    );
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

  if (cemeteryStage === "EXPLORE") {

    bwActive = false;
    bwTimer = 0;
    bwCooldown = 0;
    cemIsBW = false;

    drawCemeteryExplore();
  } else {
  
    updateBWState();
    cemIsBW = bwActive;

    drawCemeteryMatch();
  }
}

function drawCemeteryExplore() {
  // ghost moves with WASD/arrow keys
  moveGhost();
  drawGhost();

  fill(255);
  textAlign(LEFT, TOP);
  textSize(28);
  text("Level 2: Find the souls in the cemetery", 40, 30);

  textSize(18);
  text("Collect each glowing soul orb.", 40, 70);

  // orbs scattered around, collect when ghost touches them
  for (let orb of cemeteryOrbs) {
    orb.draw();
    if (orb.tryCollect(ghostX, ghostY)) {
      orbsFound++;
    }
  }

  fill(255);
  textSize(16);
  text(
    `Souls found: ${orbsFound} / ${cemeteryOrbs.length}`,
    40,
    height - 80
  );
  text(
    "Move with WASD / Arrow Keys.\n" +
    "Once all souls are collected, match them to their graves.",
    40,
    height - 50
  );

  // if all orbs collected, switch to matching phase
  if (orbsFound === cemeteryOrbs.length) {
    cemeteryStage = "MATCH";
  }
}

function drawCemeteryMatch() {
  fill(255);
  textAlign(LEFT, TOP);
  textSize(28);
  text("Level 2: Return each soul to its grave", 40, 30);

  textSize(16);
  text(
    "Drag a line from each colored orb on the right to the matching name on the left.\n" +
    "Every so often, the world turns black & white, try to remember where each color belongs.",
    40,
    70
  );

  // graves / names on left
  textSize(22);
  for (let g of graves) {
    fill(cemIsBW ? 200 : g.col);
    text(g.name, g.x, g.y);

    if (g.matched) {
      stroke(cemIsBW ? 220 : color(200, 255, 200));
      strokeWeight(2);
      line(g.x, g.y + 4, g.x + textWidth(g.name), g.y + 4);
      noStroke();
    }
  }

  // existing connections
  strokeWeight(4);
  for (let c of connections) {
    stroke(cemIsBW ? 210 : c.col);
    line(c.x1, c.y1, c.x2, c.y2);
  }
  noStroke();

  for (let orb of matchOrbs) {
    orb.draw();
  }

  if (draggingOrb) {
    strokeWeight(3);
    stroke(cemIsBW ? 210 : draggingOrb.c);
    line(dragStartX, dragStartY, mouseX, mouseY);
    noStroke();
  }

  fill(255);
  textSize(16);
  text(
    `Matches made: ${matchesMade} / ${graves.length}`,
    40,
    height - 60
  );
}

function updateBWState() {
  const dt = deltaTime / 1000.0;

  if (bwActive) {
    bwTimer += dt;
    if (bwTimer >= BW_DURATION) {
      bwActive = false;
      bwTimer = 0;
      bwCooldown = 0;
    }
  } else {
    bwCooldown += dt;
    if (bwCooldown >= BW_INTERVAL) {
      bwActive = true;
      bwCooldown = 0;
    }
  }
}

function cemeteryMousePressed() {
  if (cemeteryStage !== "MATCH") return;

  // check if mouse clicked on a match orb
  for (let orb of matchOrbs) {
    if (orb.matched) continue;

    const d = dist(mouseX, mouseY, orb.x, orb.y);
    if (d < orb.r) {
      draggingOrb = orb;
      dragStartX = orb.x;
      dragStartY = orb.y;
      return;
    }
  }
}

function cemeteryMouseReleased() {
  if (cemeteryStage !== "MATCH" || !draggingOrb) return;

  let bestGrave = null;
  let bestDist = Infinity;

  for (let g of graves) {
    if (g.matched) continue;
    const d = dist(mouseX, mouseY, g.x, g.y);
    if (d < bestDist) {
      bestDist = d;
      bestGrave = g;
    }
  }

  const THRESH = 50; // how close to count

  if (bestGrave && bestDist < THRESH) {
    const orbCol   = draggingOrb.c.toString();
    const graveCol = bestGrave.col.toString();

    if (orbCol === graveCol) {
      draggingOrb.matched = true;
      bestGrave.matched = true;
      matchesMade++;

      connections.push({
        x1: dragStartX,
        y1: dragStartY,
        x2: bestGrave.x + textWidth(bestGrave.name) / 2,
        y2: bestGrave.y,
        col: draggingOrb.c
      });

      if (matchesMade === graves.length) {
        GAME_STATE = "ENDSCREEN";
      }
    }
  }

  draggingOrb = null;
}

function drawEndScreen() {
  image(endScreen, width / 2, height / 2, width, height);
  noStroke();
  fill(0, 0, 0, 110);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);

  fill(255);
  textSize(38);
  text("You Win!", width / 2, height - 80);

  fill(255);
  textSize(18);
  text("Press R to Restart", width / 2, height - 40);
}



//ghostMovement (gameplay js)


//initializations
let ghostStill;
let ghostMove;
let ghostScareSheet;  
let scareSound;

let ghostX;
let ghostY;
let speed = 3;

let isMoving = false;
let isScaring = false;

let npc;
let npcScared = false;

// Progress system variables
let soulsCollected = 0;
let ghostPoints = 0;
const SOULS_NEEDED = 5;
const MAX_GHOST_POINTS = 20;

// Key codes
const KEY_W = 87;
const KEY_A = 65;
const KEY_S = 83;
const KEY_D = 68;
const KEY_SPACE = 32;

// sprite offsets
let stillOffsetX = 0;
let stillOffsetY = 0;
let moveOffsetX  = 0;
let moveOffsetY  = 0;


const SCARE_FRAME_COUNT = 9; 
const SCARE_FRAME_SIZE  = 32; 
let scareFrameIndex = 0;
let scareFrameTimer = 0;
let scareFrameDelay = 4; 
let scareScale = 10; 

class NPC {
  constructor(x, y, speed=100) {
    this.x = x;
    this.y = y;
    this.speed = speed;

    // dirs
    // 0 - move up
    // 1 - move right
    // 2 - move down
    // 3 - move left
    this.dir = 0;

    // states
    // 0 - stall
    // 1 - move
    this.state = 0;
    this.stateTime = 0;
  }
  
  move() {
    const dt = deltaTime / 1000.0;
    
    this.stateTime -= dt;

    if (this.stateTime <= 0) {
      this.dir = int(random(0, 4));
      this.state = int(random(0, 2));
      this.stateTime = random(1, 3);
    }

    switch (this.state) {
      case 0:
        // do nothing
        break;
      case 1:
        switch (this.dir) {
          case 0:
            if (this.y < 0) {
              this.stateTime = 0;
              break;
            }
            this.y -= this.speed * dt;
            break;
          case 1:
            if (this.x > width) {
              this.stateTime = 0;
              break;
            }
            this.x += this.speed * dt;
            break;
          case 2:
            if (this.y > height) {
              this.stateTime = 0;
              break;
            }
            this.y += this.speed * dt;
            break;
          case 3:
            if (this.x < 0) {
              this.stateTime = 0;
              break;
            }
            this.x -= this.speed * dt;
            break;
        }
        break;
    }
  }

  draw() {
    let img;

    switch (this.dir) {
      case 0:
        img = npcUp;
        break;
      case 1:
        img = npcRight;
        break;
      case 2:
        img = npcDown;
        break;
      case 3:
        img = npcLeft;
        break;
    }
    
    image(img, this.x, this.y);
  }
}

function preload() {
  ghostStill = loadImage("assets/ghostStill.png");
  ghostMove = loadImage("assets/ghostMove.png");
  ghostScareSheet = loadImage("assets/ScareGhost.png");
  scareSound = loadSound("assets/scaryghost.mp3");

  npcUp = loadImage("assets/npcUp.png");
  npcRight = loadImage("assets/npcRight.png");
  npcDown = loadImage("assets/npcDown.png");
  npcLeft = loadImage("assets/npcLeft.png");

  menuBg = loadImage("assets/cemetery_bg.png");
  cityBg = loadImage("assets/city_bg.png");
  uiButtons = loadImage("assets/buttons free.png"); 

  bgMusic = loadSound("assets/bgMusic.mp3");
}

function setup() {
  bgMusic.play();
  createCanvas(windowWidth, windowHeight); 
  
  imageMode(CENTER);

  ghostX = width / 2;
  ghostY = height / 2;

  if (scareSound) {
    scareSound.setVolume(0.3);  // volume noise levels
  }

  npc = new NPC(width/2, height/2);
  setupMenu();
  drawBG();
}

function draw() {
  if (GAME_STATE === "MENU") {
    drawMenu();
    return;
  }

  if (GAME_STATE === "INTRO") {
    drawIntroScreen();
    return;
  }

  drawBG();

  if (!npcScared) {
    npc.move();
    npc.draw();
  }

  moveGhost();
  drawGhost();
  
  drawProgressUI();
}

function moveGhost() {
  let dx = 0;
  let dy = 0;


  if (keyIsDown(LEFT_ARROW) || keyIsDown(KEY_A))  dx -= speed;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(KEY_D)) dx += speed;
  if (keyIsDown(UP_ARROW) || keyIsDown(KEY_W))    dy -= speed;
  if (keyIsDown(DOWN_ARROW) || keyIsDown(KEY_S))  dy += speed;

  ghostX += dx;
  ghostY += dy;

  isMoving = (dx !== 0 || dy !== 0);

  ghostX = constrain(ghostX, 0, width);
  ghostY = constrain(ghostY, 0, height);

}

function drawGhost() {
  let bob = sin(frameCount * 0.1) * 6;

  if (isScaring) {
    drawScareGhost(bob);
  } else {
    drawNormalGhost(bob);
  }
}

function mousePressed() {
  if (GAME_STATE === "MENU") {
    menuMousePressed();
  }
}

function drawNormalGhost(bob) {
  let img, offX, offY;

  if (isMoving) {
    img  = ghostMove;
    offX = moveOffsetX;
    offY = moveOffsetY;
  } else {
    img  = ghostStill;
    offX = stillOffsetX;
    offY = stillOffsetY;
  }

  image(img, ghostX + offX, ghostY + offY + bob);
}

function drawScareGhost(bob) {
  
  scareFrameTimer++;
  if (scareFrameTimer >= scareFrameDelay) {
    scareFrameTimer = 0;
    scareFrameIndex = (scareFrameIndex + 1) % SCARE_FRAME_COUNT;
  }


  let sx = scareFrameIndex * SCARE_FRAME_SIZE;
  let sy = 0;


  let dw = SCARE_FRAME_SIZE * scareScale;
  let dh = SCARE_FRAME_SIZE * scareScale;

  image(
    ghostScareSheet,
    ghostX, ghostY + bob,    
    dw, dh,               
    sx, sy,                  
    SCARE_FRAME_SIZE,        
    SCARE_FRAME_SIZE          
  );
}

function drawBG() {
  image(cityBg, width / 2, height / 2, width, height);
  noStroke();
  fill(0, 0, 0, 110);
  rect(0, 0, width, height);
}

function menuMousePressed() {
  playBtn.click();
}
// Progression meters UI
function drawProgressUI() {
  // Soul meter background
  fill(100, 100, 255, 150);
  rect(20, 20, 200, 20);

  // Soul meter fill
  fill(0, 0, 255);
  const soulWidth = map(soulsCollected, 0, SOULS_NEEDED, 0, 200);
  rect(20, 20, soulWidth, 20);

  // Ghost progression meter background
  fill(100, 255, 100, 150);
  rect(20, 50, 200, 20);

  // Ghost progression meter fill
  fill(0, 255, 0);
  const ghostWidth = map(ghostPoints, 0, MAX_GHOST_POINTS, 0, 200);
  rect(20, 50, ghostWidth, 20);

  // Labels
  fill(255);
  textSize(14);
  text(`Souls: ${soulsCollected}/${SOULS_NEEDED}`, 53, 24);
  text(`Ghost Points: ${ghostPoints} / ${MAX_GHOST_POINTS}`, 83, 53);
}

//scare button 
function keyPressed() {
    if (GAME_STATE === "INTRO") {
    handleIntroKeyPressed();
    return;
  }

  if (GAME_STATE !== "GAME") {
    return;
  }

  if (keyCode === KEY_SPACE) {
    isScaring = true;
    scareFrameIndex = 0;    
    scareFrameTimer = 0;

    if (!scareSound.isPlaying()) {
      scareSound.play();
    }

    // Check if NPC is in scare range
    let distance = dist(ghostX, ghostY, npc.x, npc.y);
    let scareRange = 150;

    if (distance < scareRange && !npcScared) {
      // TODO: loop over npcs if we have multiple for this check, apply to closest npc
      let rdx = npc.x - ghostX;
      let rdy = npc.y - ghostY;
    
      let dx = rdx / abs(rdx);
      let dy = rdy / abs(rdy);

      let dirX;
      let dirY;

      switch (npc.dir) {
        case 0:
          dirX = 0;
          dirY = -1;
          break;
        case 1:
          dirX = 1;
          dirY = 0;
          break;
        case 2:
          dirX = 0;
          dirY = 1;
          break;
        case 3:
          dirX = -1;
          dirY = 0;
          break;
      }

      console.log(dx, dy, dirX, dirY);

      if (abs(dx + dirX) == 2 || abs(dy + dirY) == 2) {
        npcScared = true;

        if (soulsCollected < SOULS_NEEDED) {
          soulsCollected++;
          ghostPoints += 4; 
        }
      }
    }
  }
}

function keyReleased() {
  if (GAME_STATE !== "GAME") return;

  if (keyCode === KEY_SPACE) {
    isScaring = false;
    scareSound.stop();
  }
}


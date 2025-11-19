
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


function preload() {
  ghostStill     = loadImage("assets/ghostStill.png");
  ghostMove      = loadImage("assets/ghostMove.png");
  ghostScareSheet = loadImage("assets/ScareGhost.png");
  scareSound     = loadSound("assets/scaryghost.mp3"); 
}

function setup() {
  createCanvas(windowWidth, windowHeight); 
  imageMode(CENTER);

  ghostX = width / 2;
  ghostY = height / 2;

  if (scareSound) {
    scareSound.setVolume(0.3);  // volume noise levels
  }
}

function draw() {
  background(0);

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
  text(`Souls: ${soulsCollected}/${SOULS_NEEDED}`, 25, 35);
  text(`Ghost Points: ${ghostPoints} / ${MAX_GHOST_POINTS}`, 25, 65);
}

//scare button 
function keyPressed() {
  if (keyCode === KEY_SPACE) {
    isScaring = true;
    scareFrameIndex = 0;    
    scareFrameTimer = 0;

    if (!scareSound.isPlaying()) {
      scareSound.play();
    }
  }
}

function keyReleased() {
  if (keyCode === KEY_SPACE) {
    isScaring = false;
     scareSound.stop();
  }
}

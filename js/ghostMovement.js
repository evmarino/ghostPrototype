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

let npcs = [];

// Progress system variables
let soulsCollected = 0;
const SOULS_NEEDED = 5;
const MAX_GHOST_POINTS = 20;

// Game Timer
let gameTimer = 60.0;
const INITIAL_GAME_TIME = 60.0;
let gameActive = true;

// Reminders
let showSoulReminder = false;
let soulReminderTimer = 0;
const SOUL_REMINDER_DURATION = 3.0; // seconds
let showCountdown = false;

// Screen Flash Variables
let screenFlash = false;
let flashTimer = 0;
const FLASH_DURATION = 1.0; // seconds 

// Key codes
const KEY_W = 87;
const KEY_A = 65;
const KEY_S = 83;
const KEY_D = 68;
const KEY_SPACE = 32;
const KEY_R = 82;

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

const PERSON_HEIGHT = 94 / 2;
const PERSON_WIDTH = 59 / 2;

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
            if (this.y - PERSON_HEIGHT < 0) {
              this.stateTime = 0;
              break;
            }
            this.y += -this.speed * dt;
            break;
          case 1:
            if (this.x + PERSON_WIDTH > width) {
              this.stateTime = 0;
              break;
            }
            this.x += this.speed * dt;
            break;
          case 2:
            if (this.y + PERSON_HEIGHT > height) {
              this.stateTime = 0;
              break;
            }
            this.y += this.speed * dt;
            break;
          case 3:
            if (this.x - PERSON_WIDTH < 0) {
              this.stateTime = 0;
              break;
            }
            this.x += -this.speed * dt;
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
  gameOver = loadImage("assets/gameOver.png");
  endScreen = loadImage("assets/endScreen.png");

  blueSoul = loadImage("assets/blueSoul.png");
  pinkSoul = loadImage("assets/pinkSoul.png");
  greenSoul = loadImage("assets/greenSoul.png");
  orangeSoul = loadImage("assets/orangeSoul.png");
  yellowSoul = loadImage("assets/yellowSoul.png");

  bgMusic = loadSound("assets/bgMusic.mp3");
  spookyFont = loadFont('assets/THE FANTOMS FONT.otf');
}


function setup() {
  createCanvas(windowWidth, windowHeight); 
  pixelDensity(1);  
  
  imageMode(CENTER);
  textFont(spookyFont);

  ghostX = width / 2;
  ghostY = height / 2;

  if (scareSound) {
    scareSound.setVolume(0.3);  // volume noise levels
  }

  for (let i = 0; i < 5; i++) {
    let rx = random(50, width - 50);
    let ry = random(50, height - 50);

    npcs.push(new NPC(rx, ry));
  }

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

  if (GAME_STATE === "END") {
    drawGameOver();
    return;
  }
  
   if (GAME_STATE === "CEMETERY") {
    drawCemeteryLevel();   
    return;
  }

  if (GAME_STATE === "ENDSCREEN") {
    drawEndScreen();
    return;
  }

  drawBG();

  for (const npc of npcs) {
    npc.move();
    npc.draw();
  }

  moveGhost();
  drawGhost();
  
  drawProgressUI();
  updateGameTimer();

  updateSoulReminder();
  drawCenterNotifications();
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

function drawBG() {
  image(cityBg, width / 2, height / 2, width, height);
  noStroke();
  fill(0, 0, 0, 110);
  rect(0, 0, width, height);
}

function menuMousePressed() {
  playBtn.click();
}

//function mouseDragged() {
  //if (GAME_STATE === "CEMETERY") {
  //  cemeteryMouseDragged();
  //}
//}

function mouseReleased() {
  if (GAME_STATE === "CEMETERY") {
    cemeteryMouseReleased();
  }
}


// Progression meters UI
function drawProgressUI() {
  // Soul meter background
  fill(100, 100, 255, 150);
  rect(20, 20, 300, 30);

  // Soul meter fill
  fill(0, 0, 255);
  const soulWidth = map(soulsCollected, 0, SOULS_NEEDED, 0, 300);
  rect(20, 20, soulWidth, 30);

  // Game Timer
  fill(50, 50, 50, 200);
  rect(20, 60, 300, 30);

  fill(255, 0, 0); // Normal red
  const timeWidth = map(gameTimer, 0, INITIAL_GAME_TIME, 0, 300);
  rect(20, 60, timeWidth, 30);

  // Labels
  fill(255);
  textSize(18);
  text(`Souls: ${soulsCollected}/${SOULS_NEEDED}`, 62, 26);
  text(`Time: ${ceil(gameTimer)}s`, 62, 66);
}

// Show soul collection reminder
function showSoulCollectionReminder() {
  showSoulReminder = true;
  soulReminderTimer = SOUL_REMINDER_DURATION;
}

function updateSoulReminder() {
  if (showSoulReminder) {
    soulReminderTimer -= deltaTime / 1000.0;
    if (soulReminderTimer <= 0) {
      showSoulReminder = false;
    }
  }
  if (screenFlash) {
    flashTimer -= deltaTime / 1000.0;
    let flashAlpha = map(flashTimer, 0, FLASH_DURATION, 0, 150);
    fill(255, 0, 0, flashAlpha);
    rect(0, 0, width, height);
  }

  showCountdown = (gameTimer <= 10 && gameActive);
}

function drawCenterNotifications() {
  if (showSoulReminder) {
    fill(255, 255, 255, 200);
    textSize(32);
    text(`SOUL COLLECTED!`, width / 2, height / 2 - 50);
    textSize(24);
    text(`${SOULS_NEEDED - soulsCollected} SOULS REMAINING`, width / 2, height / 2);
  }

  if (showCountdown) {
    fill(255, 50, 50);
    textSize(48);
    text(`${ceil(gameTimer)}`, width / 2, height / 2 - 100);
  }
}

function updateGameTimer() {
  if (gameActive) {

    gameTimer -= deltaTime / 1000.0;

    // Check for game over (time out)
    if (gameTimer <= 0) {
      gameTimer = 0;
      gameActive = false;
      GAME_STATE = "END";  
      return;
    }

    if (soulsCollected >= SOULS_NEEDED) {
      gameActive = false;
      startCemeteryLevel(); 
      return;
    }
  }
}

// Flash screen
function triggerScreenFlash() {
  screenFlash = true;
  flashTimer = FLASH_DURATION;
}

//scare button 
function keyPressed() {
  if (GAME_STATE === "END") {
    if (keyCode === 82) { // 'R' to restart
      restartGame();
      return;
    }
  }
  
  if (GAME_STATE === "INTRO") {
    handleIntroKeyPressed();
    return;
  }

  if (GAME_STATE === "CEMETERY") {
    return;
  }

  if (GAME_STATE !== "GAME") {
    return;
  }

  if (keyCode === KEY_SPACE && !isScaring) {
    isScaring = true;
    scareFrameIndex = 0;    
    scareFrameTimer = 0;

    if (!scareSound.isPlaying()) {
      scareSound.play();
    }

    let target, targetDist = -1;
    for (let i = 0; i < npcs.length; i++) {
      const npc = npcs[i];
      let distance = dist(ghostX, ghostY, npc.x, npc.y);

      if (targetDist == -1 || distance <= targetDist) {
        target = i;
        targetDist = distance;
      }
    }

    // Check if NPC is in scare range
    const npc = npcs[target];
    let scareRange = 150;

    if (targetDist < scareRange) {
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

      // console.log(dx, dy, dirX, dirY);

      if (abs(dx + dirX) == 2 || abs(dy + dirY) == 2) {
        if (soulsCollected < SOULS_NEEDED) {
          soulsCollected++;
          npcs.splice(target, 1);
          showSoulCollectionReminder();
        }
      } else {
        gameTimer -= 5;
        triggerScreenFlash();
      }
    }
  }
}

function mousePressed() {
  if (GAME_STATE === "MENU") {
    menuMousePressed();
    return;
  }

  if (GAME_STATE === "CEMETERY") {
    cemeteryMousePressed();  // in cemeteryLevel.js
    return;
}
}

function keyReleased() {
  if (GAME_STATE !== "GAME") return;

  if (keyCode === KEY_SPACE) {
    isScaring = false;
    scareSound.stop();
  }
}

function restartGame() {
  gameActive = true;
  soulsCollected = 0;
  gameTimer = INITIAL_GAME_TIME;
  ghostX = width / 2;
  ghostY = height / 2;
  isMoving = false;
  isScaring = false;
  npcs = [];
  for (let i = 0; i < 5; i++) {
    let rx = random(50, width - 50);
    let ry = random(50, height - 50);
    npcs.push(new NPC(rx, ry));
  }
  GAME_STATE = "GAME";
}

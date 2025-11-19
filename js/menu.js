// menu.js

let GAME_STATE = "MENU"; 
let playBtn;


const BUTTON_TILE_W = 48;
const BUTTON_TILE_H = 32;

class UIButton {
  constructor(x, y, w, h, spriteX, spriteY, onClick) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

 
    this.sx = spriteX;
    this.sy = spriteY;

    this.sw = BUTTON_TILE_W;
    this.sh = BUTTON_TILE_H;

    this.onClick = onClick;
  }

  isHover(mx, my) {
    return (
      mx > this.x - this.w / 2 &&
      mx < this.x + this.w / 2 &&
      my > this.y - this.h / 2 &&
      my < this.y + this.h / 2
    );
  }

  draw() {
    const hover = this.isHover(mouseX, mouseY);
    const sy = this.sy + (hover ? this.sh : 0);

    image(
      uiButtons,
      this.x,
      this.y,
      this.w,
      this.h,
      this.sx,
      sy,
      this.sw,
      this.sh
    );

    fill(40);
    textAlign(CENTER, CENTER);
    textSize(18);
    text("PLAY", this.x, this.y + 2);
  }

  click() {
    if (this.isHover(mouseX, mouseY) && this.onClick) {
      this.onClick();
    }
  }
}
function setupMenu() {
  const cx = width / 2;
  const cy = height / 2;


  const scale = 3; 
  const buttonW = BUTTON_TILE_W * scale;
  const buttonH = BUTTON_TILE_H * scale;

 
  const SPRITE_X = 48;
  const SPRITE_Y = 0;

  playBtn = new UIButton(
    cx,
    cy + 60,      
    buttonW,
    buttonH,
    SPRITE_X,
    SPRITE_Y,
    () => {
      GAME_STATE = "INTRO";
    }
  );
}

function drawMenu() {

  image(menuBg, width / 2, height / 2, width, height);
  noStroke();
  fill(0, 0, 0, 110);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  textSize(60);
  fill(255);
  text("Becoming A Ghost: Prototype", width / 2, height / 2 - 100);
  playBtn.draw();

  fill(255);
  textSize(18);
  text("Click PLAY to begin", width / 2, height / 2 + 130);
}

function menuMousePressed() {
  playBtn.click();
}

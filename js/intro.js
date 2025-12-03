//intro.js - before game loads (instruction screen)
function drawIntroScreen() {
  background(5, 5, 15);

  const noteW = Math.min(width * 0.55, 560);
  const noteH = Math.min(height * 0.6, 380);

 
  push();
  translate(width / 2 + 10, height / 2 + 18); 
  rectMode(CENTER);
  noStroke();
  fill(0, 0, 0, 190);
  rect(0, 0, noteW * 0.96, noteH * 0.96);
  pop();

  push();
  translate(width / 2, height / 2);
  rectMode(CENTER);

  stroke(60, 50, 20);
  strokeWeight(3);
  fill(250, 245, 190);
  rect(0, 0, noteW, noteH);


  
  noStroke();
  fill(240, 225, 150);
  rect(0, -noteH / 2 + 18, noteW, 36);

  pop();

  const tapeW = noteW * 1.1; 
  const tapeH = 22;
  const tapeY = height / 2 - noteH / 2 + 8;

  push();
  translate(width / 2, tapeY);

  rotate(radians(-2));
  rectMode(CENTER);
  noStroke();
 
  fill(0, 0, 0, 40);
  rect(0, tapeH / 2, tapeW * 0.9, 4);
  fill(245, 245, 245, 210);
  rect(0, 0, tapeW, tapeH, 6);
  fill(230, 230, 230, 140);
  rect(0, 0, tapeW * 0.7, tapeH * 0.7, 4);
  pop();


  const textX = width / 2;
  const textTop = height / 2 - noteH / 2 + 28;


  fill(40, 30, 15);
  textAlign(CENTER, TOP);
  textSize(26);
  text("You have died.", textX, textTop + 4);

 
  fill(35, 25, 15);
  textSize(14);

  const bodyTop = textTop + 48;
  const bodyWidth = noteW * 0.82;

  let msg =
    "Welcome to your afterlife orientation.\n\n" +
    "Movement:\n" +
    "  • Float with WASD or Arrow Keys.\n\n" +
    "Scaring Humans:\n" +
    "  • Sneak behind NPCs and hold SPACE to scare them.\n" +
    "  • If they see you first, that target is lost.\n\n" +
    "Souls & Progress:\n" +
    `  • Collect souls in town (Soul Meter up to ${SOULS_NEEDED}).\n` +
    `  • You have 60 seconds. If you fail a scare, the timer goes down by 5\n` +
    "  • Release souls at their graves in the cemetery to help them move on.\n" +
    "  • When your Ghost Meter is full, you become a real ghost.\n\n" +
    "Press SPACE or ENTER to begin haunting.";

  text(msg, textX - bodyWidth / 2, bodyTop, bodyWidth, noteH - 80);
}
function handleIntroKeyPressed() {
  if (keyCode === KEY_SPACE || keyCode === ENTER) {
    GAME_STATE = "GAME";
  }
}

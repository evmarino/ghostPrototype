// gameOver.js

function drawGameOver() {

  image(gameOver, width / 2, height / 2, width, height);
  noStroke();
  fill(0, 0, 0, 110);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);

  fill(255);
  textSize(18);
  text("Press R to Restart", width / 2, height - 40);
}



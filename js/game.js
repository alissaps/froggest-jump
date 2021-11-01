const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 600;

// VARIABLES
let spacePressed = false;
let gameFrame = 0; //frame count do animnation loop.
let currentScore = 0;
let score = 0;
let highscore = 0;
let gameSpeed = 5; // para criar o parallax effect
const obstaclesArray = [];
let gravity = 1;
const groundHeight = 112;

// FLOOR
const floorImage = new Image();
floorImage.src = "./images/floor.png";

// BACKGROUND
const bgImage = new Image();
bgImage.src = "./images/background.png";

// FROG
const frogSprite = new Image();
frogSprite.src = "./images/frog-sheet.png";

// OBSTACLE
const obstacleSprite = new Image();
obstacleSprite.src = "./images/rock-head.png";

//CHICKEN 
const chickenSprite = new Image();
chickenSprite.src = "./images/chicken-run.png";

// SAW
const sawSprite = new Image();
sawSprite.src = "./images/saw.png";

class Scenario {
  constructor(x1, x2, y, width, height, speedRate, sprite) {
    this.x1 = x1;
    this.x2 = x2;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speedRate = speedRate;
    this.sprite = sprite;
  }

  update() {
    if (this.x1 <= -this.width + gameSpeed * this.speedRate) {
      this.x1 = this.width; // se chegar na ponta esquerda, move para a direita
    } else {
      this.x1 -= gameSpeed * this.speedRate;
    }
    if (this.x2 <= -this.width + gameSpeed * this.speedRate) {
      this.x2 = this.width;
    } else {
      this.x2 -= gameSpeed * this.speedRate;
    }
  }

  draw() {
    ctx.drawImage(this.sprite, this.x1, this.y, this.width, this.height);
    ctx.drawImage(this.sprite, this.x2, this.y, this.width, this.height);
  }
}

class Player {
    constructor() {
      this.x = 150;
      this.y = 200;
      this.speedY = 0; // velocity y
      this.originalWidth = 800;
      this.originalHeight = 267;
      this.height = 64;
      this.width = 64;
      this.weight = 1;
      this.grounded = false;
      this.spriteWidth = this.originalWidth / 12;
      this.spriteHeight = this.originalHeight / 4;
  
      this.frameX = 1;
      this.frameY = 0;
      this.spritePace = 3;
      this.dying = false;
    }
  
    update() {
      this.y += this.speedY;
      if (this.y + this.height < canvas.height - groundHeight) {
        this.speedY += gravity;
        this.grounded = false;
      } else {
        this.speedY = 0;
        this.grounded = true;
        this.y = canvas.height - this.height - groundHeight;
      }
    }
  
    draw() {
      if(this.dying) {
        this.frameY = 3;
      } else if (!this.grounded){
        this.frameY = 1;
      } else if (this.grounded){
        this.frameY = 0;
      }
  
  
      ctx.drawImage(frogSprite, this.spriteWidth * this.frameX, this.spriteHeight * this.frameY, this.spriteWidth, this.spriteHeight, this.x, this.y, this.spriteWidth, this.spriteHeight);
      if(gameFrame % this.spritePace === 0) {
        if(this.frameX < 11) {
          this.frameX++
        } else {
          this.frameX = 0;
        }
      }
    }
  
    jump() {
      if (this.grounded) {
        this.speedY -= 25;
      }
    }
  
    fire() {}
}

class Enemy {
    constructor(x, y, width, height, spriteWidth, spriteHeight, image, spriteNumber, spritePace, speedMultiplier) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.image = image;
      this.frameX = 1;
      this.spriteWidth = spriteWidth;
      this.spriteHeight = spriteHeight;
      this.spriteNumber = spriteNumber;
      this.spritePace = spritePace;
      this.speedMultiplier = speedMultiplier;
  
      // this.speedX -=gameSpeed;
    }
    update() {
      // this.x += this.speedX;
      this.draw();
      this.x -= gameSpeed * this.speedMultiplier;
    }
  
    draw() {
    ctx.drawImage(this.image, this.spriteWidth * this.frameX, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    if(gameFrame % this.spritePace === 0) {
        if(this.frameX < this.spriteNumber - 1) {
          this.frameX++
        } else {
          this.frameX = 0;
        }
      }
    }
}


const floor = new Scenario(0, canvas.width, 0, canvas.width, canvas.height, 1, floorImage);
const bg = new Scenario(0, canvas.width, 0, canvas.width, canvas.height, 0.5, bgImage);
const frog = new Player();


function buildScenario() {
    bg.update();
    floor.update();
    bg.draw();
    floor.draw();
}
// x, y, width, height, spriteWidth, spriteHeight, image, spriteNumber, spritePace
function buildEnemies() {
    const newObstacle = new Enemy(canvas.width, canvas.height - 72  - groundHeight, 84, 84, 42, 42, obstacleSprite, 4, 15, 1);
    const newChicken = new Enemy(canvas.width, canvas.height - 68 - groundHeight, 64, 68, 32, 34, chickenSprite, 13, 4, 2);
    const newSaw = new Enemy(canvas.width + 150, canvas.height - randomIntNumber(200, 400) - groundHeight, 64, 68, 38, 38, sawSprite, 8, 6, 3);

    let chickenChance = 10;
    let sawChance = 4;

    const chance = Math.random() * 1000;
    if(chance < chickenChance) {
        obstaclesArray.unshift(newChicken);
    }
    if(gameFrame % 100 === 0) {
        obstaclesArray.unshift(newObstacle);
    }
    if(chance < sawChance) {
        obstaclesArray.unshift(newSaw);
    }


    for (let i = 0; i < obstaclesArray.length; i++) {
      obstaclesArray[i].update();
    }
    if (obstaclesArray.length > 30) {
      obstaclesArray.pop(obstaclesArray[0]);
    }

}
function drawScore() {
    ctx.font = "20px IBM Plex Mono";
    ctx.fillStyle = "#1E1E1E";
    ctx.fillText(`Score ${currentScore} / ${highscore}`, 15, 40);
    currentScore++
}

function calculateCollisions() {
    for (let i = 0; i < obstaclesArray.length; i++) {
      let obstacle = obstaclesArray[i];

        if (frog.x < obstacle.x + obstacle.width &&
        frog.x + frog.width > obstacle.x &&
        frog.y < obstacle.y + obstacle.height &&
        frog.y + frog.height > obstacle.y) {
        gameOver();
        return true;
      }
    }
}

function gameOver() {
    if(currentScore > highscore) {
        highscore = currentScore;
    }
    currentScore = 0;
    // frog.dying = true; // Para mudar o sprite

    console.log("game over");
}

function randomIntNumber(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  buildScenario();
  buildEnemies();
  frog.update();
  frog.draw();
  if (spacePressed) {
    frog.jump();
  }
//   if (currentScore > 200) {
    //   gameSpeed = 7
//   } else if(currentScore > 500) {
//       gameSpeed = 9
//   } else {
//       gameSpeed = 4
//   }  
  if(calculateCollisions()) {
      frog.dying = true;
  } else {
      frog.dying = false;
  }
  drawScore();
  gameFrame++;
  requestAnimationFrame(animate); // looping
}

animate();

window.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
      spacePressed = true;
    }
  });
  window.addEventListener("keyup", function (event) {
    if (event.code === "Space") {
      spacePressed = false;
    }
  });

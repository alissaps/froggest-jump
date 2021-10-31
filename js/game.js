const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 700;

// VARIABLES
let spacePressed = false;
let gameFrame = 0; //frame count do animnation loop.
// let score = 0;
let gameSpeed = 3; // para criar o parallax effect
const obstaclesArray = [];
let gravity = 1;
const groundHeight = 136;

// FLOOR
const floorImage = new Image();
floorImage.src = "./images/floor.png";

// BACKGROUND
const bgImage = new Image();
bgImage.src = "./images/background.png";

// FROG
const frogSprite = new Image();
frogSprite.src = "./images/frog-run.png";

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
      if(this.grounded){
        this.frameY = 0;
      } else if (!this.grounded){
        this.frameY = 1;
      } else if (this.dying){
        this.frameY = 2;
      }
  
      ctx.fillStyle = "black";
  
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

const floor = new Scenario(0, canvas.width, 0, canvas.width, canvas.height, 1, floorImage);
const bg = new Scenario(0, canvas.width, 0, canvas.width, canvas.height, 0.1, bgImage);

function buildScenario() {
    
    bg.update();
    floor.update();
    bg.draw();
    floor.draw();
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  buildScenario();
//   ctx.fillRect(frame, 20, 20, 20)
  

  frame++;
  requestAnimationFrame(animate);
}

animate();

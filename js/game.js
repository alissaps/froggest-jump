const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 700;

// VARIABLES
let spacePressed = false;
let frame = 0; //frame count do animnation loop.
// let score = 0;
let gameSpeed = 5; // para criar o parallax effect
const obstaclesArray = [];
let gravity = 1;
const groundHeight = 136;

// FLOOR
const background = new Image();
background.src = "./images/floor.png";

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
        ctx.drawImage(sprite, this.x1, this.y, this.width, this.height);
        ctx.drawImage(sprite, this.x2, this.y, this.width, this.height);
    }
}



const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 600;

////// IMAGES ///////
// START PAGE
const startPage = document.getElementById("start");

//GAME OVER PAGE
const gameOverPage = document.getElementById("game-over");

// FLOOR
const floorImage = new Image();
floorImage.src = "./assets/images/floor.png";

// BACKGROUND
const bgImage = new Image();
bgImage.src = "./assets/images/background.png";

// FROG
const frogSprite = new Image();
frogSprite.src = "./assets/images/frog-sheet.png";

// OBSTACLE
const obstacleSprite = new Image();
obstacleSprite.src = "./assets/images/rock-head.png";

//CHICKEN
const chickenSprite = new Image();
chickenSprite.src = "./assets/images/chicken-run.png";

// SAW
const sawSprite = new Image();
sawSprite.src = "./assets/images/saw.png";

// BULLET
const bulletImg = new Image();
bulletImg.src = "./assets/images/block.png";

////// SOUNDS ///////
const gameSound = new Audio();
gameSound.src = "./assets/sounds/background-song.ogg";
gameSound.volume = 0.1;

const jumpSound = new Audio();
jumpSound.src = "./assets/sounds/jump.wav";
jumpSound.volume = 0.6;

const chickenSound = new Audio();
chickenSound.src = "./assets/sounds/chicken-sound.mp3";
chickenSound.volume = 0.1;

const loseSound = new Audio();
loseSound.src = "./assets/sounds/loser.ogg";
loseSound.volume = 0.3;

class Scenario {
  constructor(x1, x2, y, width, height, speedRate, sprite, game) {
    this.x1 = x1;
    this.x2 = x2;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speedRate = speedRate;
    this.sprite = sprite;
    this.game = game;
  }
  // Condição para se o bg chegar na ponta esquerda, mover para a direita
  update() {
    if (this.x1 <= -this.width + this.game.gameSpeed * this.speedRate) {
      this.x1 = this.width;
    } else {
      this.x1 -= this.game.gameSpeed * this.speedRate;
    }
    if (this.x2 <= -this.width + this.game.gameSpeed * this.speedRate) {
      this.x2 = this.width;
    } else {
      this.x2 -= this.game.gameSpeed * this.speedRate;
    }
  }

  draw() {
    ctx.drawImage(this.sprite, this.x1, this.y, this.width, this.height);
    ctx.drawImage(this.sprite, this.x2, this.y, this.width, this.height);
  }
}

class Player {
  constructor(game) {
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
    this.firing = false;
    this.game = game;
    this.canFire = true;
    
  }

  update() {
    this.y += this.speedY;

    // GRAVITY
    if (this.y + this.height < canvas.height - this.game.groundHeight) {
      this.speedY += this.game.gravity;
      this.grounded = false;
    } else {
      this.speedY = 0;
      this.grounded = true;
      this.y = canvas.height - this.height - this.game.groundHeight;
    }
  }

  draw() {
    // Selecionando o Sprite verticalmente

    if (this.dying) {
      this.frameY = 3;
    } else if (this.firing) {
      this.frameY = 2;
    } else if (!this.grounded) {
      this.frameY = 1;
    } else if (this.grounded) {
      this.frameY = 0;
    }

    ctx.drawImage(frogSprite, this.spriteWidth * this.frameX, this.spriteHeight * this.frameY, this.spriteWidth, this.spriteHeight, this.x, this.y, this.spriteWidth, this.spriteHeight);
    if (this.game.gameFrame % this.spritePace === 0) {
      if (this.frameX < 11) {
        this.frameX++;
      } else {
        this.frameX = 0;
      }
    }
  }

  jump() {
    this.speedY = -20;
    // this.speedY -= 20;
    this.speedY = constrain(this.speedY, -20, 0); // Limitar a velocidade do salto
  }

  fire() {
    const newBullet = new Bullet(this.x, this.y, 30, 30, bulletImg, 20, this.game);

    if (this.game.bulletsArray.length < 1 && this.canFire) {
      this.game.bulletsArray.unshift(newBullet);
      this.canFire = false;
      setTimeout(() => {
          this.canFire = true
      }, 2000);
      return true;
    }
  }
}

class Enemy {
  constructor(x, y, width, height, spriteWidth, spriteHeight, image, spriteNumber, spritePace, speedMultiplier, game, kind) {
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
    this.game = game;
    this.kind = kind;
  }
  update() {
    this.x -= this.game.gameSpeed * this.speedMultiplier;
    this.draw();
  }

  draw() {
    if (this.game.gameFrame % this.spritePace === 0) {
      if (this.frameX < this.spriteNumber - 1) {
        this.frameX++;
      } else {
        this.frameX = 0;
      }
    }
    ctx.drawImage(this.image, this.spriteWidth * this.frameX, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
  }
}

class Bullet {
  constructor(x, y, width, height, image, speedX, game) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.image = image;
    this.game = game;
    this.speedX = speedX;
  }

  update() {
    this.x += this.speedX;
    this.draw();
  }

  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  checkCollisionWith(currentObstacle) {
    if (this.x < currentObstacle.x + currentObstacle.width && this.x + this.width > currentObstacle.x && this.y < currentObstacle.y + currentObstacle.height && this.y + this.height > currentObstacle.y) {
      return true;
    }
  }
}

class Game {
  constructor() {
    this.gameFrame = 0; //frame count do animation loop.
    this.currentScore = 0;
    this.score = 0;
    this.highscore = 0;
    this.gameSpeed = 5; // para criar o parallax effect
    this.enemiesArray = [];
    this.bulletsArray = [];
    this.gravity = 1;
    this.groundHeight = 112;
    this.jumpCount = 2;
    this.floor = new Scenario(0, canvas.width, 0, canvas.width, canvas.height, 1, floorImage, this);
    this.bg = new Scenario(0, canvas.width, 0, canvas.width, canvas.height, 0.5, bgImage, this);
    this.frog = new Player(this);
    this.animationLoop;
  }

  buildScenario() {
    this.bg.update();
    this.floor.update();
    this.bg.draw();
    this.floor.draw();
  }

  buildEnemies() {
    const newObstacle = new Enemy(canvas.width, canvas.height - 72 - this.groundHeight, 84, 84, 42, 42, obstacleSprite, 4, 15, 1, this, "obstacle");
    const newChicken = new Enemy(canvas.width, canvas.height - 68 - this.groundHeight, 64, 68, 32, 34, chickenSprite, 13, 4, 2, this, "chicken");
    const newSaw = new Enemy(canvas.width + 150, canvas.height - randomSaw(240, 400) - this.groundHeight, 64, 68, 38, 38, sawSprite, 8, 6, 3, this, "saw");

    let sawChance = 7;

    const chance = Math.random() * 1000;
    const chance2 = randomSpawn(100, 300);

    if (this.gameFrame % chance2 === 0) {
      this.enemiesArray.unshift(newChicken);
      chickenSound.play();
    }
    if (this.gameFrame % 200 === 0) {
      this.enemiesArray.unshift(newObstacle);
    }
    if (chance < sawChance) {
      this.enemiesArray.unshift(newSaw);
    }

    for (let i = 0; i < this.enemiesArray.length; i++) {
      this.enemiesArray[i].update();
    }
    if (this.enemiesArray.length > 30) {
      this.enemiesArray.pop(this.enemiesArray[0]);
    }
  }

  updateBullets() {
    for (let i = 0; i < this.bulletsArray.length; i++) {
      this.bulletsArray[i].update();
      for (let j = 0; j < this.enemiesArray.length; j++) {
        if (this.enemiesArray[j].kind === "chicken" && this.bulletsArray[i] !== undefined) {
          if (this.bulletsArray[i].checkCollisionWith(this.enemiesArray[j])) {
            this.bulletsArray.splice(i, 1);
            this.enemiesArray.splice(j, 1);
          }
        }
      }
      if (this.bulletsArray[i] !== undefined) {
        if (this.bulletsArray[i].x > canvas.width) {
          this.bulletsArray.splice(i, 1);
        }
      }
    }
  }

  drawScore() {
    ctx.font = "20px IBM Plex Mono";
    ctx.fillStyle = "#1E1E1E";
    ctx.fillText(`Score ${this.currentScore} / ${this.highscore}`, 15, 40);
    this.currentScore++;
  }

  calculateCollisions() {
    for (let i = 0; i < this.enemiesArray.length; i++) {
      let obstacle = this.enemiesArray[i];

      if (this.frog.x < obstacle.x + obstacle.width && this.frog.x + this.frog.width > obstacle.x && this.frog.y < obstacle.y + obstacle.height && this.frog.y + this.frog.height > obstacle.y) {
        return true;
      }
    }
  }

  gameOver() {
    if (this.currentScore > this.highscore) {
      this.highscore = this.currentScore;
    }
    this.currentScore = 0;
    gameOverPage.classList.remove("hidden");
    canvas.classList.add("hidden");
    cancelAnimationFrame(this.animationLoop);
  }

  debug() {
    ctx.font = "20px IBM Plex Mono";
    ctx.fillStyle = "red";
    if (this.bulletsArray[0] !== undefined) {
      ctx.fillText(`Bullets: ${this.bulletsArray.length} Y: ${this.frog.y}`, 300, 40);
    }
  }

  animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.buildScenario();
    this.buildEnemies();
    if (this.frog.grounded) {
      this.jumpCount = 1;
    }
    this.frog.update();
    this.frog.draw();
    this.updateBullets();

    // this.debug();
    this.drawScore();
    if (this.calculateCollisions()) {
      this.frog.dying = true;
      this.gameSpeed = 0;
      loseSound.play();
      chickenSound.pause();
      chickenSound.currentTime = 0;
      setTimeout(() => {
        this.gameOver();
      }, 600);
    } else {
      this.frog.dying = false;
    }
    this.gameFrame++;
    this.animationLoop = requestAnimationFrame(this.animate); // Looping
  };
}

window.onload = () => {
  startPage.classList.remove("hidden");
  canvas.classList.add("hidden");
  gameOverPage.classList.add("hidden");

  document.querySelector(".start-btn").onclick = () => {
    // gameSound.play();
    start();
  };

  document.querySelector(".over-btn").onclick = () => {
    start();
  };

  function start() {
    startPage.classList.add("hidden");
    canvas.classList.remove("hidden");
    gameOverPage.classList.add("hidden");

    ctx.fillStyle = "green";
    ctx.fillRect(10, 10, 100, 100);

    const game = new Game();
    game.animate();

    document.addEventListener("keydown", function (event) {
      if (event.code === "Space") {
        if (game.jumpCount > 0 && game.jumpCount < 2) {
          game.frog.jump();
          game.jumpCount--;
          jumpSound.play();
        }
      }

      if (event.code === "KeyM") {
        game.frog.fire();
        game.frog.firing = true;
      }
    });

    document.addEventListener("keyup", function (event) {
      if (event.code === "KeyM") {
        game.frog.firing = false;
      }
    });
  }
};

function constrain(n, low, high) {
  return Math.max(Math.min(n, high), low);
}

function randomSaw(min, max) {
  return Math.round(Math.random() * (max - min) + min);
  // return Math.floor(Math.random() * 3) + 1
  // return Math.round(Math.random() * (max - min + 1)) + min;
}

function randomSpawn(min, max) {
  return Math.round(Math.random() * (max - min + 1)) + min;
}

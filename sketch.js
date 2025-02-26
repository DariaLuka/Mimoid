let W = 35;
let R = 2;
let easing = 0.1;
let y, w, grid, song;
let targetAngle = 0;
let hM = 0;

function preload() {
  song = loadSound('assets/sound.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  setupGrid();
  colorMode(HSB, 100, 100, 100);
  background(0);
  y = color(148, 0, 255);
  w = color(53, 181, 168);
  song.play();
}

function draw() {
  background(0,0.1); // Keep screen black
  push();
  
  translate(grid.offsetX, grid.offsetY); // Center the grid
 // translate(width/2,height/2);
  // let dx = (width - (grid.p.length - 1) * W) / 2;
  // let dy = (height - (grid.p[0].length - 1) * W) / 2;
  // translate(dx, dy); // Center the grid
  grid.tick();
  grid.display();
  pop();
}

// // Handle window resizing
// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
//   setupGrid();
// }

function setupGrid() {
  let size = min(600,600); // Ensure square layout
  let cols = int(size / W);
  let rows = int(size / W);
  
  let gridWidth = cols * W;
  let gridHeight = rows * W;

  let offsetX = (windowWidth - gridWidth) / 2;
  let offsetY = (windowHeight - gridHeight) / 2;

  grid = new Grid(cols, rows, offsetX, offsetY);
}

class Grid {
  constructor(w, h, offsetX, offsetY) {
    this.p = new Array(w).fill().map(() => new Array(h).fill(null));
    this.angle = 0;
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        this.p[j][i] = new Particle(j * W, i * W);
      }
    }
  }

  tick() {
    if (mouseIsPressed) {
      let x = int((mouseX-grid.offsetX) / W);
      let y = int((mouseY-grid.offsetY) / W);
      if (x >= 0 && x < this.p.length && y >= 0 && y < this.p[0].length) {
        this.p[x][y].pos.z -= 0.5;
      }
    }

    for (let x = 0; x < this.p.length; x++) {
      for (let y = 0; y < this.p[x].length; y++) {
        let p = this.p[x][y];
        if (p) {
          p.tick(x, y);
          if (x < this.p.length - 1) {
            this.angle = atan2(mouseY - height / 4, mouseX - width / 4);
            let dir = (this.angle - targetAngle) / TWO_PI;
            dir -= round(dir);
            dir *= TWO_PI;
            targetAngle += dir * easing;
            let offset = map(p.pos.z, 0, 1, 0, 3);
            push();
            translate(p.pos.x + R * 2, p.pos.y + R * 2);
            rotate(targetAngle * offset);
            hM = map(targetAngle * offset, -25, 25, 30, 90);
            stroke(hM, hM, 100);
            line(0-R*2,0-R*2, 40,0-R*2);
            pop();
          }
        }
      }
    }
  }

  display() {
    ellipseMode(RADIUS);
    noStroke();
    fill(0);
    
    for (let row of this.p) {
      for (let particle of row) {
        if (particle) {
          particle.display();
        }
      }
    }
  }
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y, 0);
    this.veloZ = 0;
    this.c = w; // Ensure `this.c` has an initial color
  }

  tick(x, y) {
    let tmp = createVector();
    if (x > 0) tmp.add(p5.Vector.sub(grid.p[x - 1][y].pos, this.pos));
    if (x < grid.p.length - 1) tmp.add(p5.Vector.sub(grid.p[x + 1][y].pos, this.pos));
    if (y > 0) tmp.add(p5.Vector.sub(grid.p[x][y - 1].pos, this.pos));
    if (y < grid.p[0].length - 1) tmp.add(p5.Vector.sub(grid.p[x][y + 1].pos, this.pos));
    this.veloZ += tmp.z * 0.004;
    this.veloZ -= this.pos.z * 0.004;
    this.veloZ -= this.veloZ * 0.05;
    this.pos.z += this.veloZ;
  }

  display() {
    if (mouseIsPressed) {
      this.c = lerpColor(w, y, constrain(this.pos.z, 0, 1));
    } else {
      this.c = lerpColor(this.c || y, w, 0.2);
    }

    fill(this.c);
    let r = lerp(1, 10, this.pos.z + 0.3);
    ellipse(this.pos.x, this.pos.y, r, r);
  }
}

// function mousePressed() {
//   if (
//     mouseX > 0 &&
//     mouseX < windowWidth &&
//     mouseY > 0 &&
//     mouseY < windowHeight
//    ) 
//   //{
//   //   let fs = fullscreen();
//   //   fullscreen(!fs);
//   // }
// }


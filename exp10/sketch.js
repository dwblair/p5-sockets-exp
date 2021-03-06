

// Keep track of our socket connection
var socket;
var peerList= new Set();
var localKey;

var y=10;


let numBalls = 0;
let spring = 0.05;
let gravity = 0.03;
let friction = -0.9;
let balls = [];

function setup() {
  //createCanvas(windowWidth, windowHeight);
  createCanvas(400, 400);
  background(0);
  //createCanvas(720, 400);
  /*
  for (let i = 0; i < numBalls; i++) {
    balls[i] = new Ball(
      random(width),
      random(height),
      random(30, 70),
      i,
      balls
    );
  }
  */
  
  // Start a socket connection to the server
  // Some day we would run this server somewhere else
  socket = io.connect('http://localhost:8899');
  // We make a named event called 'mouse' and write an
  // anonymous callback function
socket.on('peer',
    // When we receive data
    function(info) {
	 background(0);
      console.log("Got: " + info);
      localKey=info.local_key.substring(0,5);
      console.log("local_key:",localKey);
      new_peer=info.peer;
      peerList.add(new_peer.substring(0,5));
      
    }
  );

socket.on('message',
    // When we receive data
    function(info) {
	 background(0);
      console.log(info);
      sender=info.key.substring(0,5);
      message=info.value.content.text;
      console.log('sender:'+sender);
      console.log('message:'+message);
      
      numBalls=numBalls+1
      balls[numBalls-1] = new Ball(
      random(width),
      random(height),
      random(30, 70),
      numBalls-1,
      balls,
      message
    );
    
	  
    }
  );
  
}

function draw() {
  background(0);
    noStroke();
  fill(255, 204);
  balls.forEach(ball => {
    ball.collide();
    ball.move();
    ball.display();
  });
   fill(255, 204);
  text(localKey,50,50);
  x=100;
  y=100;
  peerList.forEach(function(item){
		console.log(item);
		text(item,x,y);
		y=y+20;
	  });
}

class Ball {
  constructor(xin, yin, din, idin, oin, messagein) {
    this.x = xin;
    this.y = yin;
    this.vx = 0;
    this.vy = 0;
    this.diameter = din;
    this.id = idin;
    this.others = oin;
    this.message=messagein;
  }

  collide() {
    for (let i = this.id + 1; i < numBalls; i++) {
      // console.log(others[i]);
      let dx = this.others[i].x - this.x;
      let dy = this.others[i].y - this.y;
      let distance = sqrt(dx * dx + dy * dy);
      let minDist = this.others[i].diameter / 2 + this.diameter / 2;
      //   console.log(distance);
      //console.log(minDist);
      if (distance < minDist) {
        //console.log("2");
        let angle = atan2(dy, dx);
        let targetX = this.x + cos(angle) * minDist;
        let targetY = this.y + sin(angle) * minDist;
        let ax = (targetX - this.others[i].x) * spring;
        let ay = (targetY - this.others[i].y) * spring;
        this.vx -= ax;
        this.vy -= ay;
        this.others[i].vx += ax;
        this.others[i].vy += ay;
      }
    }
  }

  move() {
    this.vy += gravity;
    this.x += this.vx;
    this.y += this.vy;
    if (this.x + this.diameter / 2 > width) {
      this.x = width - this.diameter / 2;
      this.vx *= friction;
    } else if (this.x - this.diameter / 2 < 0) {
      this.x = this.diameter / 2;
      this.vx *= friction;
    }
    if (this.y + this.diameter / 2 > height) {
      this.y = height - this.diameter / 2;
      this.vy *= friction;
    } else if (this.y - this.diameter / 2 < 0) {
      this.y = this.diameter / 2;
      this.vy *= friction;
    }
  }

  display() {
	fill(255, 204);
    ellipse(this.x, this.y, this.diameter, this.diameter);
    fill(0);
    text(this.message,this.x,this.y);
  }
}

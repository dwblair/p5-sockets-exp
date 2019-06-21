
var particles_a = [];
var particles_b = [];
var particles_c = [];
var nums =20;
var noiseScale = 800;

// Keep track of our socket connection
var socket;
var peerList= new Set();
var localKey;
var message;

var y=10;


canvasWidth=400;
canvasHeight=400;


function setup() {
  //createCanvas(windowWidth, windowHeight);
  createCanvas(canvasWidth, canvasHeight);
  //background(0);
  //createCanvas(720, 400);
  

  
  // Start a socket connection to the server
  // Some day we would run this server somewhere else
  socket = io.connect('http://localhost:8899');
  // We make a named event called 'mouse' and write an
  // anonymous callback function
socket.on('peer',
    // When we receive data
    function(info) {
	 //background(0);
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
	// background(0);
      console.log(info);
      sender=info.key.substring(0,5);
      message=info.value.content.text;
      console.log('sender:'+sender);
      console.log('message:'+message);
      	  
    }
  );
  
}

function draw() {
background(32);
stroke(255,0,0);
x=100;
y=100;
peerList.forEach(function(item){
		console.log(item);
		text(item,x,y);
		y=y+20;
});

}

function Particle(x, y){
	this.dir = createVector(0, 0);
	this.vel = createVector(0, 0);
	this.pos = createVector(x, y);
	this.speed = 0.4;

	this.move = function(){
		var angle = noise(this.pos.x/noiseScale, this.pos.y/noiseScale)*TWO_PI*noiseScale;
		this.dir.x = cos(angle);
		this.dir.y = sin(angle);
		this.vel = this.dir.copy();
		this.vel.mult(this.speed);
		this.pos.add(this.vel);
	}

	this.checkEdge = function(){
		if(this.pos.x > width || this.pos.x < 0 || this.pos.y > height || this.pos.y < 0){
			this.pos.x = random(50, width);
			this.pos.y = random(50, height);
		}
	}

	this.display = function(r){
		ellipse(this.pos.x, this.pos.y, r, r);
	}
}


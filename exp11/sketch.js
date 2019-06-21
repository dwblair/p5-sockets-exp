

// Keep track of our socket connection
var socket;
var peerList= new Set();
var localKey;

var y=10;

var mass = [];
var positionX = [];
var positionY = [];
var velocityX = [];
var velocityY = [];

canvasWidth=400;
canvasHeight=400;


function setup() {
  //createCanvas(windowWidth, windowHeight);
  createCanvas(canvasWidth, canvasHeight);
  //background(0);
  //createCanvas(720, 400);
  
r = height * 0.45;
  theta = 0;
  theta_vel = 0;
  theta_acc = 0.0001;
  
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
      
      addNewParticle(message.length/1000);
	  
    }
  );
  
}

function draw() {
background(32);
	
	for (var particleA = 0; particleA < mass.length; particleA++) {
		var accelerationX = 0, accelerationY = 0;
		
		for (var particleB = 0; particleB < mass.length; particleB++) {
			if (particleA != particleB) {
				var distanceX = positionX[particleB] - positionX[particleA];
				var distanceY = positionY[particleB] - positionY[particleA];

				var distance = sqrt(distanceX * distanceX + distanceY * distanceY);
				if (distance < 1) distance = 1;

				var force = (distance - 100) * mass[particleB] / distance;
				accelerationX += force * distanceX;
				accelerationY += force * distanceY;
			}
		}
		
		velocityX[particleA] = velocityX[particleA] * 0.99 + accelerationX * mass[particleA];
		velocityY[particleA] = velocityY[particleA] * 0.99 + accelerationY * mass[particleA];
	}
	
	for (var particle = 0; particle < mass.length; particle++) {
		positionX[particle] += velocityX[particle];
		//positionY[particle] += velocityY[particle];
		
		ellipse(positionX[particle], positionY[particle], mass[particle] * 1000, mass[particle] * 1000);
	}
}

function addNewParticle(massin) {
	//mass.push(random(0.003, 0.03));
	mass.push(massin);
	positionX.push(canvasWidth/2+random(0,10));
	positionY.push(canvasHeight/2+random(0,10));
	velocityX.push(0);
	velocityY.push(0);
}

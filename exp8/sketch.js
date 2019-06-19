

// Keep track of our socket connection
var socket;
var peerList= new Set();

var y=10;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(200,200,200);
  // Start a socket connection to the server
  // Some day we would run this server somewhere else
  socket = io.connect('http://localhost:8899');
  // We make a named event called 'mouse' and write an
  // anonymous callback function
socket.on('peer',
    // When we receive data
    function(info) {
	 background(200,200,200);
      console.log("Got: " + info);
      peerList.add(info.substring(0,5));
      console.log(peerList);
      x=50;
      y=50;
      //y=100;
      // Draw a blue circle
      background(200,200,200);
      fill(255,0,0);
      noStroke();
      //ellipse(x,y,80,80);
      //text(info,x,y);
      peerList.forEach(function(item){
		console.log(item);
		text(item,x,y);
		y=y+20;
	  });
	  
	    
    }
  );

}

function draw() {
  // Nothing
}

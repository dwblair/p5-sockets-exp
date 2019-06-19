

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
      local_key=info.local_key.substring(0,5);
      console.log("local_key:",local_key);
      new_peer=info.peer;
      peerList.add(new_peer.substring(0,5));
      console.log(peerList);
      x=50;
      y=50;
      background(200,200,200);
      fill(0,0,255);
      noStroke();
      text(local_key,x,y);
      x=x+100;
      fill(255,0,0);
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

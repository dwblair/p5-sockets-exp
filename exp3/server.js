// Based off of Shawn Van Every's Live Web
// http://itp.nyu.edu/~sve204/liveweb_fall2013/week3.html


// HTTP Portion
var http = require('http');
// URL module
var url = require('url');
var path = require('path');
var discovery = require('discovery-swarm')
var hypercore = require('hypercore')
var pump = require('pump')

var feed = hypercore('sending', {
  valueEncoding: 'json'
})

feed.append({ 
  type: 'chat-message',
  nickname: 'cat-lover',
  text: 'hello world', 
  timestamp: '2018-11-05T14:26:000Z' // new Date().toISOString()
}, function (err, seq) {
  if (err) throw err
  console.log('Data was appended as entry #' + seq)
})

process.stdin.on('data', function (data) {
  feed.append({
    type: 'chat-message',
    nickname: 'cat-lover',
    text: data.toString(),
    timestamp: new Date().toISOString()
  })
})

feed.createReadStream({live:true})
  .on('data', function (data) {
    console.log(data.timestamp + '> ' + data.text.trim())
})

var swarm = discovery()

feed.ready(function () {
  // we use the discovery as the topic
//  swarm.join(feed.discoveryKey)
//  swarm.on('connection', function (connection) {
 //   console.log('(New peer connected!)')
//	data={"ip":2323};
    // We use the pump module instead of stream.pipe(otherStream)
    // as it does stream error handling, so we do not have to do that
    // manually.
    
    // See below for more detail on how this work.
   // pump(connection, feed.replicate({ live: true }), connection)
  //})
  console.log('public key:', feed.key.toString('hex'))
})

// Using the filesystem module
var fs = require('fs');

var server = http.createServer(handleRequest);
server.listen(8080);

console.log('Server started on port 8080');

function handleRequest(req, res) {
  // What did we request?
  var pathname = req.url;
  
  // If blank let's ask for index.html
  if (pathname == '/') {
    pathname = '/index.html';
  }
  
  // Ok what's our file extension
  var ext = path.extname(pathname);

  // Map extension to file type
  var typeExt = {
    '.html': 'text/html',
    '.js':   'text/javascript',
    '.css':  'text/css'
  };

  // What is it?  Default to plain text
  var contentType = typeExt[ext] || 'text/plain';

  // User file system module
  fs.readFile(__dirname + pathname,
    // Callback function for reading
    function (err, data) {
      // if there is an error
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + pathname);
      }
      // Otherwise, send the data, the contents of the file
      res.writeHead(200,{ 'Content-Type': contentType });
      res.end(data);
    }
  );
}


// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(server);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function (socket) {
  
    console.log("We have a new client: " + socket.id);
  swarm.join(feed.discoveryKey)
swarm.on('connection', function (connection,info) {
console.log('peer connected!');
	console.log(info);
 socket.broadcast.emit('peer', info);

});

    // When this user emits, client side: socket.emit('otherevent',some data);
    socket.on('mouse',
      function(data) {
        // Data comes in as whatever was sent, including objects
        console.log("Received: 'mouse' " + data.x + " " + data.y);
      
        // Send it to all other clients
        socket.broadcast.emit('mouse', data);
        
        // This is a way to send to everyone including sender
        // io.sockets.emit('message', "this goes to everyone");

      }
    );

    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
  }
);

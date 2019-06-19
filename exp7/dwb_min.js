
//usage: node min.js --cabal cabal://0201400f1aa2e3076a3f17f4521b2cc41e258c446cdaa44742afe6e1b9fd5f82

var Headless = require('./headless')
var minimist = require("minimist")
var argv = minimist(process.argv.slice(2))

var key = argv.cabal || 'cabal://0571a52685ead4749bb7c978c1c64767746b04dcddbca3dc53a0bf6b4cb8f398'

var opts = {}

var cabalkey = key.replace("cabal://", "").replace("cbl://", "")

var headless = Headless(cabalkey, { temp: opts.temp || false })

console.log("connect to swarm");

headless.connect()

headless.onPeerConnected((peerId) => {
        send_packet={ type: "peerConnected", data: peerId};
        console.log(send_packet);
        console.log(`${peerId} connected`)
        console.log('got peers', headless.peers())
    })

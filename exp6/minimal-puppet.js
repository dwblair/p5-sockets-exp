var Headless = require('./headless')
var thunky = require("thunky")
var WebSocket = require("ws")
var minimist = require("minimist")
var argv = minimist(process.argv.slice(2))

if (!argv.addr) {
    console.error("ya gotta gimme a ws server with --addr <srv>")
    process.exit(0)
}

var key = argv.cabal || 'cabal://0571a52685ead4749bb7c978c1c64767746b04dcddbca3dc53a0bf6b4cb8f398'

function Puppet (cabalkey, server, opts) {
    if (!(this instanceof Puppet)) return new Puppet(cabalkey, opts)
    if (!opts) opts = {}
    this.cabalkey = cabalkey.replace("cabal://", "").replace("cbl://", "")
    this.ws = new WebSocket(server)
    this.headless = Headless(cabalkey, { temp: opts.temp || false })
    this.POST_INTERVAL = 5000 /* ms */
    this.localKey = thunky((cb) => {
        this.headless.id(cb)
    })
    this.register()

    /* wss keep-alive junk */
    // this._heartbeat = () => {
    //     clearTimeout(this._pingTimeout)
    //     this._pingTimeout = setTimeout(() => {
    //         this.ws.terminate()
    //         console.log("TERMINATED!!!!!!!!!")
    //         console.log("TERMINATED!!!!!!!!!")
    //         console.log("TERMINATED!!!!!!!!!")
    //         console.log("TERMINATED!!!!!!!!!")
    //     }, 15000)
    // }
    //
    // this.ws.on("open", this._heartbeat)
    // this.ws.on("ping", this._heartbeat)
    // this.ws.on("close", () => {
    //     clearTimeout(this._pingTimeout)
    // })

    this.wsevents = {
        connect: () => {
            console.log("connect to swarm")
            this.headless.connect()
        },
        disconnect: () => {
            console.log("disconnect from swarm")
            this.headless.disconnect()
        },
        startPosting: () => {
            this.startPosting()
        },
        stopPosting: () => {
            this.stopPosting()
        },
        setNick: (nick) => {
            this.nick(nick)
        }
    }

    this.ws.on("message", (m) => {
        m = JSON.parse(m)
        if (m.type in this.wsevents) this.wsevents[m.type](m.data)
    })

    this.headless.onPeerConnected((peerId) => {
        this.send({ type: "peerConnected", data: peerId})
        console.log(`${peerId} connected`)
        console.log('got peers', this.headless.peers())
    })

    this.headless.onPeerDisconnected((peerId) => {
        this.send({ type: "peerDisconnected", data: peerId})
      console.log(`${peerId} left`)
    })

    this.headless.onMessageReceived((data) => {
        var peerId = data.key
        var contents
        if (data.value && data.value.content && data.value.content.text) {
            contents = data.value.content.text
        }
        this.send({ type: "messageReceived", data: { peerId, contents }})
    })
}

Puppet.prototype.init = function () {
    this.headless.nick('headless')
    this.headless.connect()
}

Puppet.prototype.send = function (obj) {
    this.localKey((key) => {
        obj["peerid"] = key
        obj["cabal"] = this.cabalkey
        this.ws.send(JSON.stringify(obj))
    })
}

Puppet.prototype.post = function (msg) {
    this.send(msg)
    this.headless.post({ message: msg.data })
}

Puppet.prototype.nick = function (nick) {
    console.log("change nick :))")
    this.headless.nick(nick)
    this.send({ type: "nickChanged", data: nick })
}

Puppet.prototype.startPosting = function () {
    if (this.postloop) {
        clearInterval(this.postloop)
    }
    this.postloop = startInterval(() => {
        this.post({ type: "messagePosted", data: "" + new Date().toUTCString() })
    }, this.POST_INTERVAL)
}

Puppet.prototype.stopPosting = function () {
    console.log("stop posting")
    if (this.postloop) {
        clearInterval(this.postloop)
    }
}

Puppet.prototype.register = function () {
    this.send({ type: "register" })
}

function startInterval (f, interval) {
    f()
    return setInterval(f, interval)
}

var puppet = new Puppet(key, argv.addr, { temp: argv.temp })
puppet.init()

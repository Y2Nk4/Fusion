let net = require('net'),
    EventEmitter = require('events').EventEmitter,
    assert = require('assert'),
    SocketHandler = require('./socket'),
    udpProto = require('./lib/udpProto/udpProto')


class ProxyServer extends EventEmitter{
    constructor (options) {
        super();
        this.options = options || {}
        this.clientSockets = []

        console.log(this.options)

        assert.ok(this.options.mainServerHost, 'mainServerHost is required')
        assert.ok(this.options.mainServerPort, 'mainServerPort is required')
        assert.ok(this.options.localServerPort, 'localServerPort is required')

        this.mainServerHost = this.options.mainServerHost
        this.mainServerPort = this.options.mainServerPort
        this.localServerPort = this.options.localServerPort
        this.localServerHost = this.options.localServerHost || '0.0.0.0'
    }

    listen (port, host, cb) {
        if(typeof port === 'function'){
            cb = port
        } else {
            this.localServerPort = port || this.localServerPort
            this.localServerHost = host || this.localServerHost
        }

        if (this.options.receiveUDP) {
            this.localServer = udpProto.createServer(this.localServerPort);

            this.localServer.on('listening', () => {
                if (cb) cb()
            })

            this.localServer.on('connect', (socket) => {
                console.log('== someone connects')
                this.clientSockets.push(new SocketHandler(socket, this.options))
            })
        } else {
            this.localServer = net.createServer((socket) => {
                console.log('== someone connects')
                this.clientSockets.push(new SocketHandler(socket, this.options))
            })

            this.localServer.listen(this.localServerPort, cb)
        }

        this.localServer.on('error', (error) => {
            console.log('server error:', error)
        })
    }
}

module.exports = ProxyServer

let net = require('net'),
    EventEmitter = require('events').EventEmitter,
    assert = require('assert'),
    SocketHandler = require('./socket')


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

        this.remoteSocket = new net.Socket()

        this.remoteSocket.on('error', (error) => {
            console.log('remote socket error:', error)
        })

        this.remoteSocket.connect(this.mainServerPort, this.mainServerHost, () => {
            this.localServer = net.createServer((socket) => {
                console.log('== someone connects')

                this.clientSockets.push(new SocketHandler(socket, this.options, this.remoteSocket))
            })

            this.localServer.listen(this.localServerPort)

            if (cb) cb()
        })
    }
}

module.exports = ProxyServer

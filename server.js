let net = require('net'),
    EventEmitter = require('events').EventEmitter,
    assert = require('assert')


class ProxyServer extends EventEmitter{
    constructor (options) {
        super();
        this.options = options || {}

        console.log(this.options)

        assert.ok(this.options.mainServerHost, 'mainServerHost is required')
        assert.ok(this.options.mainServerPort, 'mainServerPort is required')
        assert.ok(this.options.localServerPort, 'localServerPort is required')

        this.mainServerHost = this.options.mainServerHost
        this.mainServerPort = this.options.mainServerPort
        this.localServerPort = this.options.localServerPort
        this.localServerHost = this.options.localServerHost || '0.0.0.0'
    }

    listen (port, host) {
        this.localServerPort = port || this.localServerPort
        this.localServerHost = host || this.localServerHost

        this.localServer = net.createServer((socket) => {
            console.log('someone connects')

            this.localServerSocket = socket
        })

        this.localServer.listen(this.localServerPort)
    }
}

module.exports = ProxyServer

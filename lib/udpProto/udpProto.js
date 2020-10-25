let udpProtoServer = require('./udpProtoServer'),
    udpProtoSocket = require('./udpProtoSocket')

module.exports = {
    createServer (port, host) {
        return new udpProtoServer(port, host)
    },

    connect(port, host, localPort = null) {
        return new udpProtoSocket(null, null, {
            localPort: localPort,
            remoteHost: host,
            remotePort: port
        })
    }
}

let udpProtoServer = require('./udpProtoServer'),
    udpProtoSocket = require('./udpProtoSocket')

module.exports = {
    createServer (port, host) {
        return new udpProtoServer(port, host)
    },

    connect(port, host, localPort) {
        return new udpProtoSocket(null, null, {
            remoteHost: host,
            remotePort: port
        })
    }
}

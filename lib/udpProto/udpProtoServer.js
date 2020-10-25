let dgram = require('dgram'),
    EventEmitter = require('events').EventEmitter,
    udpProtoSocket = require('./udpProtoSocket')

class udpProtoServer extends EventEmitter {
    constructor (port, host, sockets = [], options = {}) {
        super()

        this.sockets = sockets

        this.server = dgram.createSocket('udp4')
        if (port) {
            this.server.bind(port)
            this.localPort = port

            this.server.on('listening', () => { this.emit('listening', port) })
            this.server.on('message', this.onMessage);
        } else {
            let startPort = 10000,
                endPort =65535;

            (async () => {
                let tryPort = async () => {
                    let tmpSocket = dgram.createSocket('udp4')
                    tmpSocket.bind(startPort, host)

                    tmpSocket.on('listening', () => {
                        this.server = tmpSocket
                        this.localPort = startPort
                        this.emit('listening', startPort)
                        this.server.on('message', this.onMessage);
                    })

                    tmpSocket.on('error', async (err) => {
                        if (++startPort > endPort) {
                            this.emit('error', new Error('No Ports is available'))
                        } else {
                            await tryPort()
                        }
                    })
                }
                await new Promise(() => {
                })
            })()
        }

    }

    onMessage (msg, rinfo) {
        // UDP Proto Format (LE):
        // 1 Bytes of UInt - Receive Port
        // 4 Bytes of UInt - Session Id
        // 4 Bytes of UInt - Sequence Number
        // Lefts - Payload

        let ReceivePort = msg.readUIntLE(0, 1),
            SessionId = msg.readUIntLE(1, 4),
            SequenceNumber = msg.readUIntLE(4, 4),
            Payload = msg.slice(8)

        let socket = this.sockets.filter(item => item.sessionId === SessionId)

        if (socket.length > 0) {
            socket = socket[0]
            socket.emit('data', Payload)
        } else {
            socket = new udpProtoSocket(SessionId, SequenceNumber, {
                localPort: this.localPort,
                remoteSentPort: rinfo.port,
                remoteHost: rinfo.address,
                remotePort: ReceivePort
            })
            this.sockets.push(socket)
            this.emit('connect', socket)
            socket.emit('data', Payload)
        }
    }
}

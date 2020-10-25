let EventEmitter = require('events').EventEmitter,
    crypto = require('crypto'),
    dgram = require('dgram'),
    udpProtoServer = require('./udpProtoServer')

class udpProtoSocket extends EventEmitter {
    constructor (SessionId, SequenceNumber = 0, options = {}) {
        super()

        this.udpSocket = dgram.createSocket('udp4')
        this.options = options

        if (!this.options.localPort) {
            this.localServer = new udpProtoServer(null, '0.0.0.0', [this])
            this.localServer.on('listening', (port) => {
                this.options.localPort = port
            })
        }

        this.sessionIdByte = crypto.randomBytes(4)
        this.sessionId = SessionId || this.sessionIdByte.readUIntLE(0, 4)
        this.SequenceNumber = (SequenceNumber && SequenceNumber < 2 ** 32 - 16) ? SequenceNumber : 0
    }

    write (message) {
        let msg = Buffer.alloc(5);

        this.SequenceNumber++
        msg.writeUIntLE(this.options.localPort, 0, 1)
        msg.writeUIntLE(this.SequenceNumber, 1, 4)
        msg = Buffer.concat([
            msg,
            this.sessionIdByte,
            message
        ])
        this.udpSocket.send(msg, this.options.remotePort, this.options.remoteAddress, (err) => {
            if (err) console.error('Error Occurred while sending UDP Pkg:', err)
        })
    }
}

module.exports = udpProtoSocket

/**
 * @Author: Y2Nk4
 * @description: Socket handler
 * */
let EventEmitter = require('events').EventEmitter,
    net = require('net'),
    udpProto = require('./lib/udpProto/udpProto'),
    varint = require('varint'),
    versionCodeMap = require('./data/minecraft-versions')

class SocketHandler extends EventEmitter {
    constructor (socket, options, remoteSocket) {
        super()

        this.socket = socket
        this.options = options
        this.live = true
        this.isConnectedOrigin = false

        if (options.sendUDP) {
            // send through UDP Protocol
            this.originSocket = udpProto.connect(options.mainServerPort, options.mainServerHost)
        } else {
            // Using TCP
            this.originSocket = new net.Socket();

            this.originSocket.connect(options.mainServerPort, options.mainServerHost, () => {
                console.log('connected to main server')
            })
        }

        let readFirstHandShake = false

        // debug

        this.originSocket.on('error', (error) => {
            console.log('error', error)
        })
        this.socket.on('error', (error) => {
            console.log('socket error', error)
        })

        /*this.originSocket.connect(options.mainServerPort, options.mainServerHost, () => {
            console.log('connected to origin')

            this.originSocket.pipe(this.socket)
            this.socket.pipe(this.originSocket)
        })

        this.socket.on('data', (clientData) => {
            console.log('receiving data:', clientData)
        })*/

        this.socket.on('data', (clientData) => {
            if (!readFirstHandShake) {
                readFirstHandShake = true
                // decode handshake

                try {
                    let versionCode = varint.decode(clientData.slice(2, 4)),
                        version = versionCodeMap[versionCode] || 'unknown',
                        domainLength = clientData.readUIntLE(4, 1),
                        domain = clientData.slice(5, 5 + domainLength).toString(),
                        port = clientData.readUInt16BE(5 + domainLength),
                        state = varint.decode(clientData.slice(7 + domainLength, 7 + domainLength + 2)),
                        stateName = state === 1 ? 'FetchStatus' : 'Login'

                    console.log('handShake Data:', { versionCode, domain, port, state, stateName })
                } catch (e) {
                    console.log('failed to parse data')
                }
            }

            this.originSocket.write(clientData)
        })
        this.originSocket.on('data', (serverData) => {
            if (this.live){
                this.socket.write(serverData)
            }
        })

        this.socket.on('close', () => {
            this.live = false
            console.log('client socket closed')
            this.emit('close')

            if (this.originSocket.destroy) this.originSocket.destroy()
        })

        this.socket.on('end', () => {
            console.log('client socket ends')
        })
    }
}

module.exports = SocketHandler

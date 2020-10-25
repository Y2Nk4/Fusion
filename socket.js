/**
 * @Author: Y2Nk4
 * @description: Socket handler
 * */
let EventEmitter = require('events').EventEmitter,
    net = require('net'),
    udpProto = require('./lib/udpProto/udpProto')

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

        // debug
        let i = 0

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
            if (i <= 5) {
                console.log(clientData, clientData.toString())
                i++
            }

            this.originSocket.write(clientData)
        })
        this.originSocket.on('data', (serverData) => {
            if (i <= 5) {
                console.log('origin return', this.live, serverData.toString())
                i++
            }

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

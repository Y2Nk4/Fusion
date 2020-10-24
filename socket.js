/**
 * @Author: Y2Nk4
 * @description: Socket handler
 * */
let EventEmitter = require('events').EventEmitter,
    net = require('net'),
    tasks = []

class SocketHandler extends EventEmitter {
    constructor (socket, options, remoteSocket) {
        super()

        this.socket = socket
        this.options = options
        this.live = true
        this.originSocket = new net.Socket();
        this.isConnectedOrigin = false

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

        this.originSocket.connect(options.mainServerPort, options.mainServerHost, () => {
            console.log('connected to main server')
        })

        this.socket.on('data', (clientData) => {
            console.log(clientData)

            this.originSocket.write(clientData)
        })
        this.originSocket.on('data', (serverData) => {
            console.log('origin return', this.live, serverData)
            if (this.live){
                this.socket.write(serverData)
            }
        })

        this.socket.on('close', () => {
            this.live = false
            console.log('client socket closed')
            this.emit('close')

            this.originSocket.destroy()
        })

        this.socket.on('end', () => {
            console.log('client socket ends')
        })
    }
}

module.exports = SocketHandler

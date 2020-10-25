let udpProto = require('../lib/udpProto/udpProto')

let socket = udpProto.connect(2020, 'localhost')

setTimeout(() => {
    socket.write(Buffer.from('test'))
}, 100)

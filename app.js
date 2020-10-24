let Server = require('./server'),
    config = require('./config/config')

let proxyServer = new Server(config)

proxyServer.listen()

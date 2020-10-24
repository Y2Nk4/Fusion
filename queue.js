let EventEmitter = require('events').EventEmitter

class Queue extends EventEmitter{
    constructor(options) {
        super()

        this.options = options
        this.queue = []
    }

    addTask (task) {

    }
}

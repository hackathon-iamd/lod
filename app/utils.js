var utils = {};


/**
 * Iterator
 */
utils.Iterator = function (o) {
    /**
     * 
     * @type {Object}
     */
    this.o = o;

    /**
     * 
     * @type {Array}
     */
    this.keys = Object.keys(o);

    /**
     * 
     * @type {Number}
     */
    this.cursor = 0;
};


/**
 * Whether iterator has next item
 * @return {Boolean}
 */
utils.Iterator.prototype.hasNext = function() {
    return this.keys.length > this.cursor;
};


/**
 * Next item
 * @return {Mixed}
 */
utils.Iterator.prototype.next = function() {
    return this.o[this.keys[this.cursor++]];
};



/**
 * Queue
 */
utils.Queue = function () {
    
    /**
     * 
     * @type {Array}
     */
    this.queue = [];
};

/**
 * 
 * @param {[type]} o [description]
 */
utils.Queue.prototype.add = function (o) {
    this.queue.push(o);
}


/**
 * 
 * @return {[type]} [description]
 */
utils.Queue.prototype.peek = function () {
    return undefined !== this.queue[0] ? this.queue[0] : null;
};

/**
 * 
 * @return {[type]} [description]
 */
utils.Queue.prototype.poll = function () {
    return this.queue.shift();
};


/**
 * 
 * @return {[type]} [description]
 */
utils.Queue.prototype.remove = function () {
    this.queue.shift();
};

/**
 * 
 * @return {[type]} [description]
 */
utils.Queue.prototype.empty = function () {
    return this.queue.length == 0;
};


module.exports = utils;
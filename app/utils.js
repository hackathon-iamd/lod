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

/**
 * 
 * @type {Object}
 */
utils.Index = function () {
    this.root = {};
}

/**
 * Index an element
 * @param  {[type]} element
 */
utils.Index.prototype.put = function (element, cb) {
    var node = this.root;
    var i=0;
    var next = function () {
        if (i < element.length) {
            if (undefined == node[element[i]]) {
                node[element[i]] = {};
            }
            node = node[element[i]];
            i++;
            next();
        } else {
            cb();
        }
    }
    next();
};


utils.Index.prototype.has = function (element, cb) {
    var node = this.root;
    var i=0;
    var next = function () {
        if (i < element.length) {
            if (undefined == node[element[i]]) {
                cb(false);
                return;
            }
            node = node[element[i]];
            i++;
            next();
        } else {
            cb(true);
        }
    }
    next();
}

utils.Index.prototype.hasSync = function (element) {
    var node = this.root;
    for (var i=0; i < element.length; i++) {
        if (undefined == node[element[i]]) {
            return false;
        }
        node = node[element[i]];
    }
    return true;
}


module.exports = utils;
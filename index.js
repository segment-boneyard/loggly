
/**
 * Module dependencies.
 */

var Emitter = require('events').EventEmitter;
var debug = require('debug')('loggly');
var request = require('request');
var assert = require('assert');
var os = require('os');

/**
 * Levels.
 */

var levels = {
  debug: 0,
  info: 1,
  notice: 2,
  warning: 3,
  error: 4,
  critical: 5,
  alert: 6,
  emergency: 7
};

/**
 * Expose `Client`.
 */

module.exports = Client;

/**
 * Initialize a new loggly client.
 *
 * @param {String} token
 * @param {Object} [opts]
 * @api public
 */

function Client(token, opts) {
  opts = opts || {};
  assert(token, 'token required');
  this.url = opts.url || 'https://logs-01.loggly.com/bulk/' + token + '/tag/bulk';
  this.bufferSize = opts.bufferSize || 100;
  this.flushInterval = opts.flushInterval || 5000;
  this.host = opts.host || os.hostname();
  this.level = opts.level || levels.info;
  this.token = token;
  this.buffer = [];
  this.start();
}

/**
 * Inherit from `Emitter.prototype`.
 */

Client.prototype.__proto__ = Emitter.prototype;

/**
 * Send batch `msgs` to loggly.
 *
 * @param {Array} msgs
 * @param {Function [fn]
 * @api public
 */

Client.prototype._send = function(msgs, fn){
  var body = msgs.join('\n');
  var len = Buffer.byteLength(body);
  var self = this;

  debug('>> %d messages %s bytes', msgs.length, len);

  var opts = {
    body: body,
    uri: this.url,
    method: 'post',
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': len
    }
  };

  request(opts, function(err, res){
    debug('<< %s', res.statusCode);
    if (err) self.emit('error', err);
    if (res.statusCode >= 400) self.emit('error', new Error(res.statusCode + ' response'));
    if (fn) fn(err, res);
  });
};

/**
 * Start the flusher.
 *
 * @api public
 */

Client.prototype.start = function(){
  var self = this;
  this.timer = setInterval(function(){
    if (self.buffer.length) self.flush();
  }, this.flushInterval);
};

/**
 * Stop the flusher.
 *
 * @api public
 */

Client.prototype.stop = function(){
  clearInterval(this.timer);
};

/**
 * Log the given `msg`.
 *
 * @param {Object} msg
 * @api public
 */

Client.prototype.send = function(msg){
  debug('>> %j (%s/%s)', msg, this.buffer.length, this.bufferSize);
  msg.timestamp = Date.now();
  msg.hostname = this.host;
  this.buffer.push(JSON.stringify(msg));
  if (this.buffer.length >= this.bufferSize) this.flush();
};

/**
 * Flush messages.
 *
 * @param {Function} [fn]
 * @api public
 */

Client.prototype.flush = function(fn){
  var msgs = this.buffer;
  this.buffer = [];
  this._send(msgs, fn);
};

/**
 * Log level methods.
 */

Object.keys(levels).forEach(function(level){
  Client.prototype[level] = function(type, props){
    var n = levels[level];
    if (this.level > n) return;
    this.send(merge({
      type: type,
      level: level
    }, props || {}));
  };
});

/**
 * Merge b into a and return a.
 */

function merge(a, b) {
  for (var k in b) a[k] = b[k];
  return a;
}
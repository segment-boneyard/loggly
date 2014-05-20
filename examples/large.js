
var Loggly = require('..');

var log = new Loggly(process.env.TOKEN, {
  bufferSize: 1500,
  flushInterval: 15000
});

setInterval(function(){
  log.send({ level: 'info', foo: 'bar' })
  log.info('something')
  log.error('boom', { error: 'something exploded' })
}, 20);
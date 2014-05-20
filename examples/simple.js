
var Loggly = require('..');
var log = new Loggly(process.env.TOKEN);

setInterval(function(){
  log.send({ level: 'info', foo: 'bar' })
  log.info('something')
  log.error('boom', { error: 'something exploded' })
}, 300);
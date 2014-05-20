
# loggly

  Loggly client for node that buffers messages and perform bulk requests out of the box.

## Installation

```
$ npm install segmentio/loggly
```

## Example

```js
var Loggly = require('loggly');
var log = new Loggly('your-token-here');

log.send({ level: 'info', foo: 'bar' })
log.info('something')
log.warn('some stuff', { info: 'here' })
```

## Options

 - `bufferSize` size of the queue [100]
 - `flushInterval` flush interval in ms [5000]
 - `host` hostname defaulting to os.hostname()
 - `level` log level [info]

## Levels

  Syslog level methods are provided.

# License

  MIT
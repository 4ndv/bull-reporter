# bull-reporter

A tiny package for collecting Bull queue stats and put em in statsd server

## Installation

To use it, you'll need to install `bull-reporter` and `lynx` npm packages.

## Usage

```javascript
const Queue = require('bull')
const BullReporter = require('bull-reporter')
const Lynx = require('lynx')

const queue = new Queue('my_awesome_queue')
const queueTwo = new Queue('my_awesome_queue_two')
const lynx = new Lynx('localhost', 8125)


new BullReporter(queue, lynx, { interval: 1000 }) // You can override one of the default options
new BullReporter(queueTwo, lynx) // Or don't specify any options at all to use defaults
```

Default options

```javascript
// All the default options
const options = {
  interval: 2000, // How often we collecting counters from redis
  errorLogger: console.error,
  prefix: 'bull_reporter',
  listenEvents: [ // Set to false if you don't need to listen any events
    'error',
    'active',
    'stalled',
    'progress',
    'completed',
    'failed',
    'paused',
    'resumed',
    'cleaned'
  ]
}
```

## Telegraf template

If you're using Telegraf's statsd server, there is template for it:

```
templates = [
  "bull_reporter.* measurement.measurement.queue_name.metric"
]
```

Where `bull_reporter` - is your prefix from the options

[Example of Grafana queue using this template](https://i.imgur.com/nAicDWI.png)

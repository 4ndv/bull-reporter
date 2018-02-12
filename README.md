# bull-reporter

A tiny package for collecting Bull queue stats and put em in statsd server

Usage:

```javascript
const Queue = require('bull')
const BullReporter = require('bull-reporter')
const Lynx = require('lynx')

const queue = new Queue('my_awesome_queue')
const lynx = new Lynx('localhost', 8125)

const reporter = new BullReporter(queue, lynx)
```

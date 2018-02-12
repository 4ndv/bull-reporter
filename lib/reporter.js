'use strict'

class BullReporter {
  /**
   * Constructor
   * @param {Queue} queue Bull queue
   * @param {Lynx} lynx Lynx instance
   * @param {Object} options Options
   */
  constructor (queue, lynx, options) {
    const defaults = {
      interval: 2000,
      errorLogger: console.error,
      prefix: 'bull_reporter',
      listenEvents: [
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

    if (!options) options = {}

    this.options = Object.assign({}, defaults, options)

    this.queue = queue
    this.lynx = lynx

    // Check is it bull queue instance or not
    if (!this.queue.name || !this.queue.getJobCounts) {
      throw new Error('Not a bull queue provided as a first argument')
    }

    // Check is it lynx instance or not
    if (!this.lynx.gauge) {
      throw new Error('Not a lynx instance provided as a second argument')
    }

    // Create event handlers for queue
    this.setupEventHandlers()

    // Start counters update
    this.start()
  }

  /**
   * Starts stat collection
   * @return {undefined}
   */
  start () {
    this.interval = setInterval(this.collect.bind(this), this.options.interval)
  }

  /**
   * Stops stat collection
   * @return {undefined}
   */
  stop () {
    clearInterval(this.interval)
  }

  /**
   * Returns key name
   * @param {String} type Type of measurement (counts, events)
   * @param {String} key Name of the key
   * @return {String}
   */
  buildKey (group, key) {
    return [
      this.options.prefix,
      group,
      this.queue.name,
      key
    ].join('.')
  }

  /**
   * Enables event handlers for queue
   * @return {undefined}
   */
  setupEventHandlers () {
    if (!this.options.listenEvents) {
      return
    }

    for (const event of this.options.listenEvents) {
      this.queue.on('global:' + event, () => {
        const key = this.buildKey('events', event)

        this.lynx.increment(key)
      })
    }
  }

  /**
   * Returns collects and reports metrics to statsd
   * @param {Queue} queue Bull queue
   * @return {Promise<Object>}
   */
  collect () {
    return this.queue.getJobCounts()
      .then((counts) => {
        const result = {}

        // Report queue counts
        for (const origKey of Object.keys(counts)) {
          const key = this.buildKey('counts', origKey)

          this.lynx.gauge(key, counts[origKey])
        }
      })
      .catch((error) => {
        if (this.options.errorLogger) {
          this.options.errorLogger('Error occured while queue count collect')
          this.options.errorLogger('Queue: ' + this.queue.name)
          this.options.errorLogger(error)
        }
      })
  }
}

module.exports = BullReporter

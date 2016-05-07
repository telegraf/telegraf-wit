var debug = require('debug')('telegraf:wit')
var fetch = require('node-fetch')
var compose = require('koa-compose')
var qs = require('qs')
var util = require('util')

var wit = TelegrafWit.prototype
module.exports = TelegrafWit

function TelegrafWit (token, opts) {
  this.token = token
  opts = opts || {}
  this.apiVersion = opts.apiVersion || '20160330'
  this.maxHops = opts.maxHops || 20
  this.mergeHandlers = []
  this.messageHandlers = []
  this.actionHandlers = {}
  this.onAction('clear-context', function * () { this.state.wit.context = {} })
}

wit.getMeaning = function (message, outcomes, context) {
  var params = {
    q: message,
    n: outcomes || 1,
    context: JSON.stringify(context || {})
  }
  var url = `https://api.wit.ai/message?${qs.stringify(params)}`
  return fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/json',
      'v': this.apiVersion
    }
  }).then((response) => response.json())
}

wit.converse = function (sessionId, message, context) {
  var params = {
    session_id: sessionId
  }
  if (message) {
    params.q = message
  }
  var url = `https://api.wit.ai/converse?${qs.stringify(params)}`
  return fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'v': this.apiVersion
    },
    body: JSON.stringify(context || {})
  }).then((response) => response.json())
}

wit.onError = function (err) {
  var msg = err.stack || err.toString()
  console.error(msg.replace(/^/gm, '  '))
}

wit.onMerge = function () {
  var fns = [].slice.call(arguments)
  this.mergeHandlers = this.mergeHandlers.concat(fns)
}

wit.onMessage = function () {
  var fns = [].slice.call(arguments)
  this.messageHandlers = this.messageHandlers.concat(fns)
}

wit.onAction = function (action) {
  if (!action) {
    throw new Error('Action is empty')
  }
  var fns = [].slice.call(arguments, 1)
  this.actionHandlers[action] = this.actionHandlers[action] || []
  this.actionHandlers[action] = this.actionHandlers[action].concat(fns)
}

wit.middleware = function () {
  var self = this

  this.clearContext = function () {
    this.state.wit.context = {}
  }

  return function * (next) {
    if (!this.session) {
      throw new Error("Can't find session")
    }
    if (!this.message || !this.message.text) {
      yield next
      return
    }
    var sessionId = `${this.message.chat.id}:${this.message.from.id}`
    var sessionState = this.session.__wit || {}
    this.state.wit = {
      context: sessionState
    }
    var messageText = this.message.text
    var hops = self.maxHops
    while (hops > 0) {
      var response = yield self.converse(sessionId, messageText, this.state.wit.context)
      debug('response', response.type)
      if (response.type === 'stop') {
        break
      }
      this.state.wit.entities = response.entities
      this.state.wit.confidence = response.confidence
      this.state.wit.message = response.msg
      switch (response.type) {
        case 'msg':
          yield compose(self.messageHandlers)
          break
        case 'merge':
          yield compose(self.mergeHandlers)
          break
        case 'action':
          if (self.actionHandlers[response.action]) {
            yield compose(self.actionHandlers[response.action])
          }
          break
        case 'error':
          self.onError(new WitError('Wit error: Please check your "action" and "merge" handlers', response))
          break
      }
      messageText = null
      hops--
    }
    this.session.__wit = this.state.wit.context
    if (hops === 0) {
      self.onError(new WitError('Hop limit reached: Please check your "action" and "merge" handlers', response))
    }
  }
}

function WitError (message, payload) {
  Error.captureStackTrace(this, this.constructor)
  this.name = this.constructor.name
  this.message = message
  this.type = 'Wit error'
  this.payload = payload
}

util.inherits(WitError, Error)

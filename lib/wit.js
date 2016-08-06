const debug = require('debug')('telegraf:wit-api')
const fetch = require('node-fetch')
const qs = require('qs')

class WitAI {
  constructor (token, opts) {
    this.token = token
    this.opts = Object.assign({
      apiRoot: 'https://api.wit.ai',
      apiVersion: '20160801'
    }, opts)
  }

  meaning (message, msgId, threadId, context) {
    const params = {
      q: message,
      msg_id: msgId,
      thread_id: threadId,
      context: JSON.stringify(context || {})
    }
    const url = `${this.opts.apiRoot}/message?${qs.stringify(params)}`
    debug('meaning call', url)
    return fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json',
        'v': this.apiVersion
      }
    }).then((response) => response.json())
  }

  converse (sessionId, message, context) {
    const params = {
      session_id: sessionId,
      q: message
    }
    const url = `${this.opts.apiRoot}/converse?${qs.stringify(params)}`
    debug('converse call', url)
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
}

module.exports = WitAI

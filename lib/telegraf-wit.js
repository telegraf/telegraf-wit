const { mount, compose } = require('telegraf')
const WitContext = require('./context')
const WitAI = require('./wit')

class TelegrafWit {
  constructor (token, opts) {
    this.opts = Object.assign({maxHops: 20}, opts)
    this.witAI = new WitAI(token, this.opts)
    this.hadlers = new Map()
    this.on('error', () => {
      console.error('Wit error: Check your "action" and "merge" handlers')
    })
    this.on('clear-context', (ctx) => {
      ctx.wit.context = null
    })
  }

  on (action, ...fns) {
    this.hadlers.set(action, compose(fns))
    return this
  }

  meaning (...args) {
    return this.witAI.meaning(...args)
  }

  middleware () {
    return mount('text', (ctx, next) => {
      if (!ctx.session) {
        throw new Error("Can't find session")
      }
      ctx.wit = new WitContext(this.witAI, ctx, this.hadlers)
      return ctx.wit.handleConversation(`${ctx.message.chat.id}-${ctx.message.from.id}`, ctx.message.text, this.opts.maxHops)
    })
  }
}

module.exports = TelegrafWit

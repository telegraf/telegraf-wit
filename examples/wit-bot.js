var Telegraf = require('telegraf')
var TelegrafWit = require('../lib/telegraf-wit')
var Promise = require('bluebird')

// Related wit app: https://wit.ai/dotcypress/weather/stories
var app = new Telegraf(process.env.BOT_TOKEN)
var wit = new TelegrafWit(process.env.WIT_TOKEN)

app.use(Telegraf.memorySession())

// Add wit middleware
app.use(wit.middleware())

// Merge handlers
wit.onMerge(function * () {
  var location = firstEntityValue(this.state.wit.entities, 'location')
  if (location) {
    this.state.wit.context.city = location
  }
})

// Message handlers
wit.onMessage(function * () {
  if (this.state.wit.confidence > 0.01) {
    yield this.reply(this.state.wit.message)
  }
})

// Action handlers
wit.onAction('get-forecast', function * () {
  if (this.state.wit.confidence > 0.02) {
    this.replyWithChatAction('typing')
    yield Promise.delay(2000)
    this.state.wit.context.forecast = 'As usual :)'
  }
})

app.startPolling()

function firstEntityValue (entities, entity) {
  var val = entities && entities[entity] &&
  Array.isArray(entities[entity]) &&
  entities[entity].length > 0 &&
  entities[entity][0].value
  if (!val) {
    return null
  }
  return typeof val === 'object' ? val.value : val
}

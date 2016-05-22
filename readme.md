# wit.ai middleware for Telegraf

[![Build Status](https://img.shields.io/travis/telegraf/telegraf-wit.svg?branch=master&style=flat-square)](https://travis-ci.org/telegraf/telegraf-wit)
[![NPM Version](https://img.shields.io/npm/v/telegraf-wit.svg?style=flat-square)](https://www.npmjs.com/package/telegraf-wit)

[wit.ai](https://wit.ai/) middleware for [Telegraf (Telegram bot framework)](https://github.com/telegraf/telegraf)(Telegram bot framework).

> Easily create text bots that humans can chat with on their preferred messaging platform.
>
> -- <cite>wit.ai</cite>

## Installation

```js
$ npm install telegraf-wit
```

## Message processing example
  
```js
var Telegraf = require('telegraf')
var TelegrafWit = require('telegraf-wit')

var telegraf = new Telegraf(process.env.BOT_TOKEN)
var wit = new TelegrafWit(process.env.WIT_TOKEN)

telegraf.on('text', function * () {
  var result = yield wit.getMeaning(this.message.text)
  // reply to user with wit result
  this.reply(JSON.stringify(result, null, 2))
})

telegraf.startPolling()

```

## Story processing example
  
```js
var Telegraf = require('telegraf')
var TelegrafWit = require('telegraf-wit')

var telegraf = new Telegraf(process.env.BOT_TOKEN)
var wit = new TelegrafWit(process.env.WIT_TOKEN)

// We need session for store story data
telegraf.use(Telegraf.memorySession())

// Add wit conversation middleware
telegraf.use(wit.middleware())

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
    this.state.wit.context.forecast = 'As usual :)'
  }
})

telegraf.startPolling()

```

There are some other [examples](https://github.com/telegraf/telegraf-wit/tree/master/examples).


## Error Handling

By default TelegrafWit will print all wit errors to stderr. 
To perform custom error-handling logic you can set `onError` handler:

```js
var wit = new TelegrafWit(process.env.WIT_TOKEN)

wit.onError = function(err){
  log.error('wit error', err)
}
```

## API

* `TelegrafWit`
  * [`new TelegrafWit(token)`](#new)
  * [`.getMeaning(message, outcomes, context)`](#getMeaning)
  * [`.onMerge(fn, [fn, ...])`](#onMerge)
  * [`.onMessage(fn, [fn, ...])`](#onMessage)
  * [`.onAction(actionName, fn, [fn, ...])`](#onAction)
  * [`.middleware()`](#middleware)
 
<a name="new"></a>
#### `TelegrafWit.new(token)`

Initialize new TelegrafWit.

| Param | Type | Description |
| --- | --- | --- |
| token | `String` | Wit Token |

* * *

<a name="getMeaning"></a>
#### `TelegrafWit.getMeaning(message, outcomes, context)` => `Promise`

Returns the extracted meaning from a sentence, based on the context. 

| Param | Type | Description |
| ---  | --- | --- |
| message  | `String` | User message |
| outcomes  | `Int`(Optional) | The number of n-best outcomes you want to get back. default is 1 |
| context  | `Object`(Optional) | User’s context |

* * *

<a name="onMerge"></a>
#### `TelegrafWit.onMerge(fn, [fn, ...])`

Adds merge handlers to app

| Param | Type | Description |
| ---  | --- | --- |
| fn  | `Promise/Generator Function` | Merge handler |

* * *

<a name="onMessage"></a>
#### `TelegrafWit.onMessage(fn, [fn, ...])`

Adds wit message handlers to app

| Param | Type | Description |
| ---  | --- | --- |
| fn  | `Promise/Generator Function` | Message handler |

* * *

<a name="onMessage"></a>
#### `TelegrafWit.onAction(actionName, fn, [fn, ...])`

Adds action handlers to app 

| Param | Type | Description |
| ---  | --- | --- |
| actionName | `String` | Action name |
| fn  | `Promise/Generator Function` | Message handler |

* * *

## User context

Telegraf user context props:

```js
wit.onXXX(function * (){
  this.state.wit.confidence   // confidence
  this.state.wit.context      // wit context
  this.state.wit.message      // wit message
  this.state.wit.entities     // entities
});
```

## License

The MIT License (MIT)

Copyright (c) 2016 Vitaly Domnikov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


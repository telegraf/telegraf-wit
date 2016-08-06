# wit.ai middleware for Telegraf

[![Build Status](https://img.shields.io/travis/telegraf/telegraf-wit.svg?branch=master&style=flat-square)](https://travis-ci.org/telegraf/telegraf-wit)
[![NPM Version](https://img.shields.io/npm/v/telegraf-wit.svg?style=flat-square)](https://www.npmjs.com/package/telegraf-wit)

[wit.ai](https://wit.ai/) middleware for [Telegraf](https://github.com/telegraf/telegraf).

> Easily create text bots that humans can chat with on their preferred messaging platform.
>
> -- <cite>wit.ai</cite>

## Installation

```js
$ npm install telegraf-wit
```

## Message processing example
  
```js
const Telegraf = require('telegraf')
const TelegrafWit = require('telegraf-wit')

const telegraf = new Telegraf(process.env.BOT_TOKEN)
const wit = new TelegrafWit(process.env.WIT_TOKEN)

telegraf.on('text', (ctx) => {
  return wit.getMeaning(ctx.message.text)
    .then((result) => {
      // reply to user with wit result
      return ctx.reply(JSON.stringify(result, null, 2))
    })
})

telegraf.startPolling()

```

## Story processing example
  
```js
const Telegraf = require('telegraf')
const TelegrafWit = require('telegraf-wit')

const telegraf = new Telegraf(process.env.BOT_TOKEN)
const wit = new TelegrafWit(process.env.WIT_TOKEN)

// Session for storing story context
telegraf.use(Telegraf.memorySession())

// Add wit conversation middleware
telegraf.use(wit.middleware())

// Merge handlers
wit.on('merge', (ctx) => {
  ctx.wit.context.city = firstEntityValue(ctx.wit.entities, 'location')
})

// Message handlers
wit.on('message', (ctx) => ctx.reply(ctx.wit.message))

// Action handlers
wit.on('get-forecast', (ctx) => {
  if (ctx.wit.confidence > 0.02) {
    ctx.wit.context.forecast = 'As usual :)'
  }
})

telegraf.startPolling()

```

There are some other [examples](https://github.com/telegraf/telegraf-wit/tree/master/examples).


## Error Handling

By default TelegrafWit will print all wit errors to stderr. 
To perform custom error-handling logic you can set `onError` handler:

```js
wit.on('error', (ctx) => {
  console.error('wit error', err)
}
```

## API

* `TelegrafWit`
  * [`new TelegrafWit(token)`](#new)
  * [`.meaning(message, outcomes, context)`](#meaning)
  * [`.on(action, actionName, fn, [fn, ...])`](#on)
  * [`.middleware()`](#middleware)
 
<a name="new"></a>
#### `TelegrafWit.new(token)`

Initialize new TelegrafWit.

| Param | Type | Description |
| --- | --- | --- |
| token | `String` | Wit Token |

* * *

<a name="meaning"></a>
#### `TelegrafWit.meaning(message, msgId, threadId, context)` => `Promise`

Returns the extracted meaning from a sentence, based on the context. 

| Param | Type | Description |
| ---  | --- | --- |
| message | `String` | User message |
| messageId | `String` | Message id |
| threadId | `String` | Thread id |
| context | `Object`(Optional) | User’s context |

* * *

<a name="on"></a>
#### `TelegrafWit.on(action, fn, [fn, ...])`

Adds merge handlers to app

| Param | Type | Description |
| ---  | --- | --- |
| action  | `String` | action type(merge, message, %function name%) |
| fn  | `Function` | Middleware |

* * *

## Telegraf context

Telegraf user context props:

```js
wit.on('message', (ctx) => {
  ctx.wit.context      // wit context
  ctx.wit.confidence   // confidence
  ctx.wit.message      // wit message
  ctx.wit.entities     // entities
  ctx.wit.quickReplies // Quick replies
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


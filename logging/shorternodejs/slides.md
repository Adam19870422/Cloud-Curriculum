# Logging Node.js

---

### Use a library!

A library can ...

- write logs in various logging levels
- define a root logging level for filtering purposes
- customizable logging formats
- define one or multiple destinations for the logs (e.g. file, console, db)
- customizable patterns

`console` does not have those capabilities 

Notes:

- `console`
  - only writes to `stdout` or `stderr`
  - no ability to toggle logs
  - no log levels (`info` and `debug` are aliases for `log`, `warn` for `error`) → misleading API
  - calls to `console.log()` are [not consistently synchronous or asynchronous](https://nodejs.org/api/process.html#process_a_note_on_process_i_o) → performance
- console can still be useful e.g. for debugging but it should not be used for logging
- we decided to use `winston` because:
  - it is the most widely used logging framework
  - it is used by the SAP logging library
- all of the suggested frameworks have a similar feature set and usage, so it should be easy to transfer the examples

---

### Create a logger

```javascript
import winston from 'winston'

const { createLogger, format, transports } = winston
const { json } = format
const { Console } = transports

const logger = createLogger({
  level: 'info',
  format: json()
  transports: [
    new Console()
  ]
})

export default logger
```
<!-- .element class="code-xl" data-tags="javascript" -->

```typescript
import winston from 'winston'

export type { Logger } from 'winston'

const { createLogger, format, transports } = winston
const { json } = format
const { Console } = transports

const logger = createLogger({
  level: 'info',
  format: json()
  transports: [
    new Console()
  ]
})

export default logger
```
<!-- .element class="code-xl" data-tags="typescript" -->

Notes:

- see here for info: <https://github.com/winstonjs/winston#creating-your-own-logger>
- to create a logger with winston you can use createLogger function
- this method takes a configuration object as parameter and returns a logger instance
- config-attributes:
  - level: log only if logged level is equal of below this level (default: info)
  - format: formatting for info (log??) messages (default: json)
  - transports: set of logging targets
  - refer to the documentation for more config-attributes

---

### Example log statements

```typescript
  // Info logging
  logger.info('The application started successfully.')
  
  // Error logging
  logger.error('A severe error has ocurred.')
```

```shell
{"message":"The application started successfully.","level":"info"}
{"message":"A severe error has ocurred.","level":"error"}
```

Notes:

- Alternative log statements
  - `logger.log({ level: 'info', message: 'The application started successfully.'})`
  - `logger.log('info', 'The application started successfully.')`

---

### Avoid String Concatenation and use Parameterized logging instead

- Enable String interpolation by using `winston.format.splat()`

```javascript
const logger = createLogger({
  format: combine(
    splat(), // enable string interpolation
    simple()
  ),
   // ..
})

// ❌ Don't
logger.info("Participant Nr. : " + i + " has id " + participantId)
logger.info(`Participant Nr. :${i} has id ${participantId}`)

// ✅ Do
logger.info('Participant No. %d has id %s', 15, 'Luke Skywalker')
```
<!-- .element class="code-xl" data-tags="javascript,typescript" -->

```shell
info: Participant No. 15 has id Luke Skywalker
```

Notes:

- Using string interpolation/concatenated strings has downsides:
  - regardless of whether the message is logged or not, the whole String is constructed
  - this is also the case for template literals
  - this puts up performance costs
  - better yet -> parameterized logs

- the `splat`-format allows us to use c language printf-style string interpolation using [node's util.format](https://nodejs.org/dist/latest/docs/api/util.html#util_util_format_format_args)
- the string is only constructed if the log is actually written and not filtered due to the log-level
- the order of formats matters!
- `format.simple` is one out of 5 _finalizing formats_. Without one, the log would simply be "undefined". [Read more](https://github.com/winstonjs/logform/blob/master/README.md#info-objects)

---

### Formats

```javascript
import winston from 'winston'

const { createLogger, format } = winston
const { combine, timestamp, label, prettyPrint } = format

const logger = createLogger({
  format: combine(
    label({ label: 'Joker' }),
    timestamp(),
    prettyPrint()
  ),
  // ...
})
logger.info('Why so serious?')
```
<!-- .element class="code-xl" data-tags="javascript" -->

```typescript
import winston from 'winston'

const { createLogger, format } = winston
const { combine, timestamp, label, prettyPrint } = format

const logger = createLogger({
  format: combine(
    label({ label: 'Joker' }),
    timestamp(),
    prettyPrint()
  ),
  // ...
})
logger.info('Why so serious?')
```
<!-- .element class="code-xl" data-tags="typescript" -->

```shell
{ message: 'Why so serious?', level: 'info', label: 'Joker', timestamp: '2020-06-24T08:46:41.237Z' }
```

Notes:

- The combine format allows to combine multiple formats
- label():  adds the specified label before the message
- timestamp(): adds a timestamp to the log
- prettyPrint(): finalizes the message using util.inspect (not suited for prod environments)

---

## Transports

```javascript
import winston from 'winston'

const { createLogger, transports } = winston
const { Console, File } = transports

const logger = createLogger({
  transports: [
    new Console()
  ]
})

logger.add(new File({
  filename: 'errors.log',
  level: 'error'
}))
```
<!-- .element class="code-xl" data-tags="javascript" -->

```typescript
import winston from 'winston'

export type { Logger } from 'winston'

const { createLogger, transports } = winston
const { Console, File } = transports

const logger = createLogger({
  transports: [
    new Console()
  ]
})

logger.add(new File({
  filename: 'errors.log',
  level: 'error'
}))
```
<!-- .element class="code-xl" data-tags="typescript" -->

Notes:

- Can also be added after creation -> `logger.add`
- Built-ins are Console, File, Http and Stream
- Many more third-party transports available

---

## Context information


- In winston, you can pass meta/context information to a logger instance in several ways
- One way is to pass it via an `info`, `debug`, ... statement
- Alternatively, you can create a child logger

```typescript
logger.info('User has authenticated.', { userId: 42 })
const child = logger.child({ service: 'user-service' })
child.log('User has authenticated.')
```

```shell
info: User has authenticated. {"userId":42}
info: User has authenticated. {"service":"user-service"}
```

Notes:

- it is possible to append arbitrary meta information to a log message
- it is also possible to assign meta information to a logger at creation
- children inherit all configuration and meta information

---

# Questions?

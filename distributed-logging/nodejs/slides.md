# Distributed Logging with Node.js

---

## What has to be Done?

- distributed logging system like EFK or ELK is up and running
- make it easy to **ingest, process and search** the logs

- structure the logs -> JSON
- append contextual information to logs -> Correlation ID

Notes:
- EFK = Elasticsearch, Fluentd, Kibana
- ELK = Elasticsearch, Logstash, Kibana

- when having a distributed logging system up and running already
  - how do I have to adapt my application in terms of logging?
  - goal: make it easier to ingest, process and search the logs in the log analysis stack

- this slides will focus on how to structure your logs with JSON and how to make use of the correlation-ID

---

![cf-nodejs-logging-support](https://nodei.co/npm/cf-nodejs-logging-support.png)

- collection of support libraries for node.js applications
- provides means to
  - emit structured application log messages
  - collect request metrics
- Maintained by SAP

Notes:

- tuned for the logging service available on Cloud Foundry, but also useful for other environments

---

## Minimal Example

```javascript
import log from 'cf-nodejs-logging-support'

// Formatted log message
log.info("The answer is %d", 42)
```

Notes:

- By default the logs are emitted in a JSON format

---

<!-- .slide: data-tags="typescript" -->
## Use in Typescript

- Neither cf-nodejs-logging-support nor express offer complete typescript support. 
- To use the modules you can use a declaration file like this:

```javascript
// Place in your source code directory in a types/express/index.d.ts file and reference that file in the tsconfig.json

// Expand the request interface with a field 'logger' via declaration merging
declare namespace Express {
  interface Request {
    logger: typeof import('cf-nodejs-logging-support').default
  }
}
```

```json
// in tsconfig.json add a "ts-node" config in the root level
"ts-node": {
  "compilerOptions": {
    "typeRoots": [
      "./src/types",
      "./node_modules/@types"
    ]
  }
}
```

Notes:

- By default the logs are emitted in a JSON format

---

## Middleware

- logs all incoming requests

```javascript
// Bind to express app
app.use(log.logNetwork)
```

---

## Logging Contexts

```javascript
app.get('/', function (req, res) {
  // Context bound custom message
  req.logger.info("Hello World will be sent")

  res.send('Hello World')
})
```

- Two types: **global** and **request** contexts
- middleware adds context bound loggers to request objects
- their logs have some additional fields, such as:
  - `request_id`
  - `correlation_id`

---

## Correlation ID

- read from header "`X-CorrelationID`" if set
- generated otherwise (UUIDv4)

```javascript
// Get correlation_id from logger bound to request
const id = req.logger.getCorrelationId()
```

Notes:

- Use the shown method to acquire the correlation ID in order to set in on outgoing requests.

---

# Questions?

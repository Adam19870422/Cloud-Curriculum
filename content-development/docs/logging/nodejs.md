# 🧾 Node.js Logging Basics

<!-- TrackingCookie-->
{% with pagename="logging-nodejs" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

{% include 'snippets/node22-disclaimer.md' %}

## 🎯 Learning Objectives

In this exercise you will learn

- how to integrate a logger framework (demonstrated with [winston](https://github.com/winstonjs/winston){target=_blank}) into a Node.js project
- how to use different logging levels and formats
- how to enrich the logs with meta information

## 🧠 Theory

  - General Concepts: [slides](../slides/fundamentals){target=_blank} ([with speaker notes](../slides/fundamentals/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_1alas8vj){target=_blank}
  - Node.js Specific: [slides](../slides/nodejs/?tags=typescript){target=_blank} ([with speaker notes](../slides/nodejs/?tags=typescript&showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_dg9qgus5){target=_blank}

## 💻 Exercise

In this exercise you will use `winston` to add Logging to an application.

<!-- Prerequisites-->
{% with
  required=[
    ('[Express](https://expressjs.com/){target=_blank}'),
    ('[Typescript Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html){target=_blank}'),
  ],
  beneficial=[
    ('[winston](https://github.com/winstonjs/winston){target=_blank}')
  ]
%}
{% include 'snippets/prerequisites/nodejs.md' %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="logging-ts", folder_name="logging-nodejs" %}
{% include 'snippets/clone-import/nodejs.md' %}
{% endwith %}

{% include 'snippets/install-dependencies/nodejs.md' %}

1. You can now run the application using the following command:

    ```shell
    npm start
    ```

    When the application has started you should be able to see the following log message in the console

    ```shell
    Server started on port 3000
    ```

1. You can now use following URLs to consume the endpoints.

    [http://localhost:3000/hello](http://localhost:3000/hello){target=_blank}

1. You can also try to hand a parameter to the call as follows:

    [http://localhost:3000/hello?name=Mars](http://localhost:3000/hello?name=Mars){target=_blank}

!!!info "File changes only become effective, once the application is restarted!"

    To save you from having to restart the application yourself, you can start the application with:

    ```shell
    npm run watch
    ```

    The watch script uses [nodemon](https://www.npmjs.com/package/nodemon){target=_blank} to watch the source files and restart the server whenever a change is detected.

### 🔍 Code Introduction

We have set up a simple express application which provides two endpoints that produce a greeting with the passed `name` parameter.

You can see the implementation of the endpoints in file `src/lib/create-app.ts`.

You will see that each of the endpoints (`/hello` and `/howdy`) call the `createGreeting` method of the `GreetingService` class (file `src/lib/service/greeting-service.ts`) with the arguments `"Hello"` and `"Howdy"` respectively.

The `createGreeting` method validates the provided name by checking whether it contains a number.

If the name is valid a greeting is returned, otherwise an error is thrown.

The `/howdy` endpoint is *deprecated* as pointed out by the `log.error('Deprecated endpoint used!')` call in file `src/lib/create-app.ts`.

In file `src/lib/util/logger.ts` we will encapsulate the logger functionality. And 

The main entry point is the file `src/index.ts` which brings everything together, injects all dependencies, and starts the application.

The following exercises let you engage in the task of setting up useful logs and the respective configuration for it.

!!! tip "Encapsulate the logger functionality"

    It is usually a good idea to encapsulate / wrap any third-party modules you are using, e.g. for logging or persistence.

    This ensures that if the third-party module changes its API or even if you exchange the module with another one, you don't have to change your code besides the encapsulation.

    Other consumers within (or outside) your application can keep using your wrapped / encapsulated API, which will always be stable.



### 1 - Logging Basics 📝

There are several different logging frameworks out there.
We have chosen [winston](https://github.com/winstonjs/winston){target=_blank} because it provides all our desired features, is widely used and is even used internally in SAPs logging library.
However, you should be able to easily transfer the skills you gained from these exercises to other logging frameworks, as most of them work in a similar manner.

!!! warning "Choosing a logging framework"
    Other logging frameworks might better suit your needs.
    For any project you should base your framework choice on your specific requirements.
    Some other possible frameworks are [Pino](https://www.npmjs.com/package/pino){target=_blank} and [Roarr](https://www.npmjs.com/package/roarr){target=_blank}.

#### 1.1 Install Winston 💾

You can check out the winston package here:

<a href="https://www.npmjs.com/package/winston" rel="nofollow"><img src="https://nodei.co/npm/winston.png?downloads=true&ampdownloadRank=true" alt="NPM"></a>

1. Install it with the following command:

    ```shell
    npm install winston
    ```

    !!! info "Typescript: winston Types"
        The `@types/winston` has been deprecated and `winston` provides its own type definitions, so we only need to install the `winston` module.


1. In file `src/lib/util/logger.ts`, add the following at the very start of the file to import the winston module.

    ```typescript
    import winston from 'winston'
    ```

1. And export type `Logger`, we will use it later on.
    ```typescript
    export type { Logger } from 'winston'
    ```

#### 1.2 Create a Logger Instance 📠

Now that we have imported winston we can use the required functions to create a logger instance.

In file `src/lib/util/logger.ts`:

Create and export a `logger` instance which logs to the `Console` *transport* with the `createLogger()` function.

```typescript linenums="1"
const { createLogger, transports } = winston
const { Console } = transports

const logger = createLogger({
  transports: [
    new Console()
  ]
})

export default logger
```

??? info "Code Walkthrough"
    The `createLogger()` function takes a configuration object as parameter and returns a logger instance.
    In the above snippet we are configuring our logger with a console transport.
    Transports specify where our logs are written to.
    By default winston does not configure any transport, so the logs do not get written anywhere.
    To make them visible we specify a `Console` transport in the configuration object.
    Notice that the `transports` property takes an array, implying that you can specify multiple transports.
    The following exercises will not further mention transports, but if you would like to, you can read more about them [here](https://github.com/winstonjs/winston#transports){target=_blank}.

??? tip "Use Javascripts destructuring assignment syntax"
    Use Javascripts [destructuring assignment syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment){target=_blank} to specify what you need:

    ```typescript
    const { createLogger, transports: { Console } } = winston
    ```

    That way you don't have to type `winston.*` in front of every winston functionality you are using, resulting in shorter code like this:

    ```typescript linenums="1"
    const logger = createLogger({
      transports: [
        new Console()
      ]
    })
    ```

#### 1.3 Using the Logger 📝

Let's put our newly created logger instance to use.

In file `src/index.ts`:

1. Import the `logger`.

    ```typescript
    import logger from './lib/util/logger'
    ```

1. Replace the call to `console.error` with `logger.error`.

1. Replace the call to `console.info` with `logger.info`.

    !!! info "`console`"
        The built-in `console` is fine for debugging purposes, but it should not be used for production logging, since it lacks the important features a logging framework provides, such as:
        - logging levels
        - defining a root logging level for filtering purposes
        - customizable logging formats & patterns
        - defining one or multiple destinations for the logs

#### 1.4 Pass it Around 🏈

1. In file `src/index.ts`, pass the `logger` as an argument to `GreetingService`'s `constructor` so that it uses our `logger` instance instead of `console` which is the default value, if no `logger` is passed. 

    ```typescript
    const greetingService = new GreetingService(logger)
    ```
  
1. In file `src/lib/service/greeting-service.ts`, remove the default value `console` from `GreetingService`'s constructor and specify the type of the parameter `log`.

    ```typescript
    import type { Logger } from '../util/logger'
    
    class GreetingService {

      constructor(private log: Logger) { }

      // ...
    }
    ```

1. In file `src/index.ts`, also pass the `logger` as an argument to the `createApp` *factory function*.

    ```typescript
    const app = createApp(greetingService, logger)
    ```

1. Similarly, in file `src/lib/create-app.ts`, remove the default value `console` of second parameter and specify the type for it.

    ```typescript
    import type { Logger } from './util/logger'
    
    export default (greetingService: GreetingService, logger: Logger) => {
      //...
    }
    ```


1. Hit an endpoint to invoke the logging, e.g. `http://localhost:3000/howdy?name=Partner`

    Do you notice any difference in the appearance of the logs?

The default format for the logs in winston is `JSON`.
Log formats will be covered in [exercise 3](#3-log-formats).

### 2 - Logging Levels 🗃

Every [logging level](https://github.com/winstonjs/winston#logging-levels){target=_blank} in winston is given a specific integer priority.

   The levels are numerically ascending from most important to least important.

   The following log levels are available:

  ```typescript
  {
      // most important
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      verbose: 4,
      debug: 5,
      silly: 6
      // least important
  }
  ```

??? info "Logging levels in winston"

    The logging levels are numerically **ascending** from most important to least important, meaning that 0 represents the highest priority and 6 the lowest.
    You can read more about logging levels in [the documentation](https://github.com/winstonjs/winston#logging-levels){target=_blank}.
    When the winston documentation mentions something along the lines of "logging level *info* or lower" it would translate to *info*, *warn* or *error*.
    Be aware that this ordering is not consistent across logging frameworks!

#### 2.1 Logger Methods 🖍

Each log level has a corresponding method with the same name, e.g. the `log.info()` *method* for the `info` *level*.

Let's change the logging level of the `greeting created for ${name}` message in order to not clutter up the console too much.

1. Replace the call to `this.log.info` with `this.log.debug` in file `src/lib/service/greeting-service.ts`.

    ```typescript
    this.log.debug(`greeting created for ${name}`)
    ```

1. Change the log message level for incoming requests in file `src/lib/create-app.ts` from `info` to `http`.

    ```typescript
    app.use((req, res, next) => {
      const { method, url } = req
      log.http(`${method} ${url}`)
      next()
    })
    ```

1. Change the log message level for the *deprecated* endpoint `/howdy` in file `src/lib/create-app.ts` from `error` to `warn`.

    ```typescript
    log.warn('Deprecated endpoint /howdy used!')
    ```

Can you still see these messages being logged afterwards?

#### 2.2 Root Logging Level 🌱

`winston` configures the root logging level to `info` by default.
It can be specified during instantiation.
In the following example it is set to `warn`:

```typescript
const logger = createLogger({
  level: 'warn', // default: info
  transports: [
    new Console()
  ]
})
```

1. Increase and lower the logging level of your logger.

    Try e.g. `error`, `warn`, `info`, `http`, `debug`, etc. and hit the endpoint again.

    Does the overall log output change?

1. Once done, change the log level back to `debug`.

??? info "Dynamic configuration of the logger"
    In a real project it is unlikely that you will hard code your logger configuration like this.
    Consider using different configurations for your logger depending on the environment your application is running on.

    E.g. debug-logs can be helpful during development but should not clutter up the production logs.
    [Environment variables](https://medium.com/the-node-js-collection/making-your-node-js-work-everywhere-with-environment-variables-2da8cdf6e786){target=_blank} can be used to specify the environment.

#### 2.3 Add timestamp to your Logs 🕒

The logs can be enhanced with additional information, such as timestamps.
`winston` provides a `timestamp` format which can be used to achieve this.

1. Add the timestamp format to the logger:

    ```typescript linenums="1"
    const { format } = winston
    const { timestamp } = format

    format: timestamp()
    ```

You will notice that adding the `timestamp()` format would break the logging, and only output `undefined`.

??? question "Why?"
    `winston` has a set of ***finalizing formats*** such as:

    - `json`
    - `logstash`
    - `printf`
    - `prettyPrint`
    - `simple`

    These populate a special property in the log object, that goes through all the formats.
    The value of that property is what later appears in the console.
    If no "finalizing format" is configured, that property remains `undefined`.

To combine different formats the `combine()` method can be used.

1. Adjust the format for the logger to the following:

    ```typescript linenums="1"
    const { format } = winston
    const { combine, timestamp, json } = format

    format: combine(
      timestamp(),
      json()
    )
    ```

    This will make your log outputs look like this:

    ```shell
    {"level":"warn","message":"Deprecated endpoint /howdy used!","timestamp":"2024-02-27T15:08:44.679Z"}
    ```

    The `json` format is used to format log messages as JSON objects.

#### 2.4 Parameterized Log Messages 📝

`format.splat()` is used to handle variable arguments (splats) passed to the logger.
These are preferable over string concatenation and template strings, due to performance reasons.

1. Add the `splat` format as the first format in the `combine`.

    ??? example "Need help?"

        ```typescript linenums="1"
        const { createLogger, format, transports } = winston
        const { combine, splat, timestamp, json } = format
        const { Console } = transports

        const logger = createLogger({
          level: 'debug',
          format: combine(
            splat(),
            timestamp(),
            json()
          )
        })
        ```

1. In `src/lib/greeting-service.ts`, replace the template strings in the existing logs with printf-like format messages, using the `%s` placeholder (for a full list of available placeholders please have a look at [util.format](https://nodejs.org/dist/latest/docs/api/util.html#utilformatformat-args){target=_blank}.

    ??? example "Need help?"

        ```typescript linenums="1"

        logger.info('The Ultimate Answer to %s is... %d!', 'Life, The Universe and Everything', 42)
        logger.info('Server started on http://%s:%d', 'localhost', 3000)
        ```

### 3 - Logging Meta Info 🔖

Node.js only runs within a single thread. While logging frameworks in other languages e.g. Java can use thread objects to store context information, Node.js developers have to rely on other methods.

#### 3.1 Create Child Loggers 👶

The `child()` method of a logger returns a new child logger instance, which inherits all configuration from its parent but can also be configured independently. 

1. In file `index.ts`, create a child instance of the logger and assign it to new const variable `log`.
   
      ```typescript

      const log = logger.child({})
      ```

1. Replace the calls to `logger.error` with `log.error` and `logger.info` with `log.info` to use the child logger (instead of the parent logger).

#### 3.2 Add the Module Name 👩‍🏫
The child() method also allows us to pass an object containing arbitrary metadata, e.g. `logger.child({ some: 'metadata' })`

1. Replace the argument of the `child` method with an object having a single property `module` with value `server` as metadata to identify the `server` module in the logs.
      ```typescript

      const log = logger.child({ module: 'server' })
      ```
1. Start the server and see in which logs which `module` property is shown.

#### 3.3 Add Meta to Each Module's Logs 📝
As of now we can only clearly identify the origin of the log messages for the server module.

Won't it be nice to be able to identify the origin of the log messages for `greeting-service` and `application` modules? 

1. In file `greeting-service.ts`, create a child instance of the `logger` in the `GreetingService` class's constructor and pass the `module` property as metadata to identify the `greeting-service` module logs.

      ```typescript

      { module: "greeting-service" }
      ```

1. Similarly, pass the `module` property as metadata to identify the `application` module logs in file `create-app.ts`.

      ```typescript

      { module: "application" }
      ```

1. Call the endpoints of the application to see in which logs which `module` property is shown.

1. Verify that every log is showing the `module` property of the respective `module`.

1. Adjust the tests delegating to the child in the appropriate places using `loggerStub.child.returnsThis()` to make the test cases pass.

    ??? example "Need help?"
        ```typescript
        const loggerStub = sinon.stub(logger) 
        loggerStub.child.returnsThis()
        ```

### 4 Configure File Logging 📝
As of now we have only logged to the terminal using the `Console` transport. But `winston` supports logging to other transports, e.g. to a file or to a database.

1. Add an additional [File transport](https://github.com/winstonjs/winston/blob/master/docs/transports.md#file-transport){target=_blank} to your logger instance. Set the file path as `logs/exercise-code-nodejs.log`, now you can see the metadata is logged in this file by running the smoke test via `npm run test:smoketest`.

    ??? example "Need help?"

        ```typescript
        const { transports: {File } } = winston

        transports: [
          new File({
            filename: 'file-path'
          })
        ]
        ```

1. Before you submit your solution, ensure it passes the smoke test to verify that logs are correctly written. Please note that this smoke test is primarily to test the exercise, and in a real-world product, logs wouldn't be tested this way.

## 🙌 Congratulations! Submit your solution.

{% with path_name="node/logging", language="Node.js", branch_name="logging-ts" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}


## 🏁 Summary

Good job!

In the prior exercises you introduced a logging library into an application and enhanced the existing logs with log levels and child logger.

## 📚 Recommended Reading

- [A Guide to Node.js Logging](https://www.twilio.com/blog/guide-node-js-logging){target=_blank}
- [Environment variables in Node.js](https://medium.com/the-node-js-collection/making-your-node-js-work-everywhere-with-environment-variables-2da8cdf6e786){target=_blank}
- [Logging: Best Practices for Node.JS Applications](https://blog.bitsrc.io/logging-best-practices-for-node-js-applications-8a0a5969b94c){target=_blank}

## 🔗 Related Topics

- [pino](https://github.com/pinojs/pino#readme){target=_blank}
- [roarr](https://github.com/gajus/roarr#readme){target=_blank}
- [winston transports](https://github.com/winstonjs/winston#transports){target=_blank}

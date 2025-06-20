# Python Logging Basics

<!-- TrackingCookie-->
{% with pagename="logging-python" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

## 🎯 Learning Objectives

In this exercise you will learn

- how to integrate logging library into a Python project
- how to use different logging levels and formats
- how to enrich the logs with meta information

## 🧠 Theory

  - General Concepts: [slides](../slides/fundamentals){target=_blank} ([with speaker notes](../slides/fundamentals/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_1alas8vj){target=_blank}
  - Python Specific: [slides](../slides/python){target=_blank}

## 💻 Exercise

In this exercise you will set up `Logging` to a Python application.

<!-- Prerequisites-->
{% with
  required=[
    ('[HTTP Rest](https://pages.github.tools.sap/cloud-curriculum/materials/all/http-rest/python/){target=_blank}')
  ],
  beneficial=[
    ('[Python Logging](https://docs.python.org/3/howto/logging.html){target=_blank}')
  ]
%}
{% include 'snippets/prerequisites/python.md' %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="logging-python", folder_name="logging-python" %}
{% include 'snippets/clone-import/python.md' %}
{% endwith %}

{% with folder_name="logging-python" %}
{% include 'snippets/python-create-use-virtual-env.md' %}
{% endwith %}

{% include 'snippets/install-dependencies/python.md' %}

1. You can now run the application using the following command:

    ```shell
    python src/app.py
    ```

    When the application has started you should be able to see the following log message in the console

    ```log
    * Running on all addresses (0.0.0.0)
    * Running on http://127.0.0.1:5000
    ```

1. You can now use following URLs to consume the endpoints.

    [http://localhost:5000/hello](http://localhost:5000/hello){target=_blank}

1. You can also try to hand a parameter to the call as follows:

    [http://localhost:5000/hello?name=Mars](http://localhost:5000/hello?name=Mars){target=_blank}

!!!info "File changes only become effective, once the application is restarted!"

    To save you from having to restart the application yourself, you can start the application with:

    ```shell
    pip install py-mon
    pymon src/app.py
    ```

    The watch script uses [py-mon](https://github.com/kevinjosethomas/py-mon){target=_blank} to watch the source files and restart the server whenever a change is detected.

### 🔍 Code Introduction

We have set up a simple express application which provides two endpoints that produce a greeting with the passed `name` parameter.

You can see the implementation of the endpoints in file `src/app.py`.

You will see that each of the endpoints (`/hello` and `/howdy`) call the `create_greeting` method of the `GreetingService` class (file `src/service/greeting_service.py`) with the arguments `"Hello"` and `"Howdy"` respectively.

The `create_greeting` method validates the provided name by checking whether it contains a number.

If the name is valid a greeting is returned, otherwise an error is thrown.

The `/howdy` endpoint is *deprecated* as pointed out by the `log.warn('Deprecated endpoint used!')` call in file `src/app.py`.

In file `src/util/logger.py` we will encapsulate the logger functionality.

The main entry point is the file `src/applpy` which brings everything together, and starts the application.

The following exercises let you engage in the task of setting up useful logs and the respective configuration for it.

!!! tip "Encapsulate the logger functionality"

    It is usually a good idea to encapsulate / wrap any third-party modules you are using, e.g. for logging or persistence.

    This ensures that if the third-party module changes its API or even if you exchange the module with another one, you don't have to change your code besides the encapsulation.

    Other consumers within (or outside) your application can keep using your wrapped / encapsulated API, which will always be stable.



### 1 - Logging Basics

There are several different logging frameworks out there.
We have chosen Python built-in logging module because it provides a fully-featured logging framework.
However, you should be able to easily transfer the skills you gained from these exercises to other logging frameworks, as most of them work in a similar manner.

!!! warning "Choosing a logging framework"
    Other logging frameworks might better suit your needs.
    For any project you should base your framework choice on your specific requirements.
    Some other popular frameworks are [Loguru](https://github.com/Delgan/loguru){target=_blank} and [structlog](https://www.structlog.org/en/stable/){target=_blank}.

#### 1.1 Logging Level

Hit an endpoint to invoke the logging, e.g. [http://localhost:5000/hello?name=Mars](http://localhost:5000/hello?name=Mars){target=_blank}

You may notice there are not too many output in the logs although we have placed quite a lot logger's methods like `debug()`, `info()` in the code.

This is because the default logging level is `WARNING`. By default, only messages corresponding to a logging level of warning and above are logged onto the console. 

Every [logging level](https://docs.python.org/3/library/logging.html#logging-levels){target=_blank} in Python is given a specific numeric priority.

The levels are numerically ascending from most important to least important. The following logging levels are available:

  ```typescript
  {
      // least important
      NOTSET: 0,
      DEBUG: 10,
      INFO: 20,
      WARNING: 30,
      ERROR: 40,
      CRITICAL: 50,
      // most important
  }
  ```

However, you can modify this by configuring the logger to start logging from a specific level of your choosing.

1. In file `src/util/logger.py`, add the following before creating the logger instance.

    ```python
    logging.basicConfig(level=logging.DEBUG)
    ```

1. Restart the application.

1. Hit the endpoint, e.g. [http://localhost:5000/hello?name=Mars](http://localhost:5000/hello?name=Mars){target=_blank}

    Did you notice the changes in the logs?

1. Change the logging level to `INFO` and check the logs.

#### 1.2 Logging Format

The default format for log records is `%(levelname)s:%(name)s:%(message)s`. Sometime you may want to see more information in the logs like timestamp or module name. You can customize the output by defining your own [Formatter](https://docs.python.org/3/library/logging.html#logging.Formatter){target=_blank}.

In file `src/util/logger.py`:

Add a format parameter `format='%(asctime)s - %(levelname)s - %(message)s'` in the `basicConfig()` function.

```python
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
```

Restart the application and check the logs.

### 2 - Logging Meta Info

Once you have a custom logger, you can customize its output through the [Handler](https://docs.python.org/3/library/logging.handlers.html){target=_blank}, [Formatter](https://docs.python.org/3/library/logging.html#logging.Formatter){target=_blank}, and [Filter](https://docs.python.org/3/library/logging.html#filter-objects){target=_blank} classes provided by the logging module.

There are no predefined formats like JSON in Python's Logging module. You have to combine the available [log record attributes](https://docs.python.org/3/library/logging.html#logrecord-attributes){target=_blank} to build your own formats.

1. Define a JSON formatter in file `src/util/logger.py`.

    ```python
    import json

    class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            'timestamp': self.formatTime(record, self.datefmt),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
            'funcName': record.funcName,
            'lineno': record.lineno,
            'application': 'myapp'
        }
        return json.dumps(log_record)
    ```

1. Configure the handler.

    ```python
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    ```

1. Pass the handler to the `basicConfig()` method.

    ```python
    logging.basicConfig(
        level=logging.DEBUG, 
        handlers=[handler]
    )
    ```

Restart the application. Can you still see the JSON messages being logged afterwards?

??? example "Need help?"

    ```python linenums="1"
    import logging
    import json

    class JSONFormatter(logging.Formatter):
        def format(self, record):
            log_record = {
                'timestamp': self.formatTime(record, self.datefmt),
                'level': record.levelname,
                'message': record.getMessage(),
                'module': record.module,
                'funcName': record.funcName,
                'lineno': record.lineno,
                'application': 'myapp'
            }
            return json.dumps(log_record)

    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())

    logging.basicConfig(
        level=logging.DEBUG, 
        handlers=[handler] 
    )

    logger = logging.getLogger('logging-python-exercise')
    ```

### 3 - Configure File Logging

As of now we have only logged to the terminal using the `Console` transport. But Python supports logging to other destinations, e.g. to a file.

[Handler](https://docs.python.org/3/library/logging.handlers.html){target=_blank} objects are responsible for dispatching the appropriate log messages (based on the log messages’ severity) to the handler’s specified destination. Logger objects can add zero or more handler objects to themselves. As an example scenario, an application may want to send all log messages to a log file, all log messages of error or higher to stdout.


1. Add another handler in file `src/util/logger.py`. Set the log file path as `app.log`

    ```python
    fileHandler = logging.FileHandler('app.log')
    ```

1. Pass the new handler to logging configuration.

    ```python
    logging.basicConfig(
        level=logging.DEBUG, 
        handlers=[handler1, handler2] 
    )
    ```

You will see the logs are stored in the file after re-start the application.

## 🙌 Congratulations! Submit your solution.

{% with path_name="python/logging", language="python", branch_name="logging-python" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}


## 🏁 Summary

Good job!

In the prior exercises you introduced Python logging library into an application and enhanced the existing logs with meta date and format.

## 📚 Recommended Reading

- [Python Logging HOWTO](https://docs.python.org/3/howto/logging.html){target=_blank}
- [Python Logging Cookbook](https://docs.python.org/3/howto/logging-cookbook.html){target=_blank}

## 🔗 Related Topics

- [Loguru](https://github.com/Delgan/loguru){target=_blank}
- [structlog](https://www.structlog.org/en/stable/){target=_blank}

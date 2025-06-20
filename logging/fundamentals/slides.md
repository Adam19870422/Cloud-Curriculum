# Logging Fundamentals


---


### Why do we need good logging?
- need to be able to triage issues on running systems using only logs and code
- want to automatically alert Ops/Monitoring if there is an issue

---


### But I can debug, why do I need logging?
- on Live Systems we are **not allowed** to debug if they touch or influence financial data (SOX compliance)
- on distributed cloud systems we **can't** debug (e.g. scaling, ssh deactivated by default)

Notes:

[SOX](https://en.wikipedia.org/wiki/Sarbanes%E2%80%93Oxley_Act) implies that you must not make any changes that don't leave an audit trail to systems processing financial data.
If you are debugging, you have direct access to the memory of the system...you can make changes that noone can retrace.
This applies to systems processing financial data only...but probably hard to define system boundaries for apps that are integrated with each other (in the end almost any app SAP has will lead to financial data of some sort) The law was put into place after the Enron scandal in the US, where the company leadership cooked the books and manipulated their financial reporting systems...

---



### What is worth logging? (1/2)
Customer Ticket: "I ran into an error (code 42) on Thursday at 15:42"

- Do you have the data necessary to understand/reproduce the error?
- Do you know which code ran at that time?
- Can you identify the corresponding request (e.g. Multi-threading)?


Notes:

- Potentially multiple deployments per day and hundreds of requests per second

---


### What is worth logging? (2/2)
- **Basics**
    - timestamp (UTC), thread, logger name, severity
- **Operational**
    - errors, configuration, traces (for key methods). . .
- **Categories**
    - useful for filtering: SQL, Authentication, Order, . . .
- **Business**
    - used features, purchases, response times (SLA?), . . .
- **Security**
    - login, denied access, privileged account actions, . . .


**Brainstorm! Think about scenarios!**

Notes:

The elements mentioned above are just the very basics, brainstorm and find out what you need

---




### What must not be logged?
- Passwords, credit card details, personal information (GDPR!), . . .
- Confidential information
- Respect rules set up by regulations and legislations
- Attention: Sensitive data in REST URIs or stack traces

Notes:

---



### How much should we log?
**As much as necessary** to be able to triage issues, but **as little as possible**

Notes:

Take the "as little as possible" with a grain of salt more logs will likely make it easier to triage issues, but you may have limitations on how much logging your infrastructure can handle (bandwidth) and store, see next slide.

---



### Why can't we just Log everything?
You might:
- be overwhelmed by the amount of logs
- run out of storage space
- run into performance issues

Notes:

When running on Cloud Foundry the logging backing services will "drop" (not accept) logs that exceed 250/1000 MB per hour, depending on the service-plan.
On-prem and on K8s you might simply run out of storage space for your logs and have to delete/overwrite logs that would have been valuable.

---




### Log Levels (Example)

| level | use for | example |
|-------|---------|---------|
| ERROR | critical problems needing immediate action | core functionality not working |
| WARN  | problems which need attention | connection fallbacks triggered |
| INFO  | information on the state of the system | configuration changes |
| DEBUG | information helpful only when debugging | calculation subtotals |
| TRACE | very detailed execution information | method parameter values |
<!-- .element style="font-size: x-large" -->
 


**Implement alerting for ERROR and WARN**<br/>
**Default Log level in prod should be WARN (which includes error)**



Notes:

- The above is just an example, there are different recommendations out there and one size does not fit all, see next slide.
- Having prod log level set to error is a good default - If you need more info to triage a reproducible issue you can still increase the loglevel to INFO or DEBUG for specific parts of your application or for individual classes.

---


### Log Levels
There is no single best config - it depends on your setup! 
- Check your constraints
- Agree on criteria for log levels and use them consistently
- Add alerting for ERROR and WARN early in development

Notes:

The reason why you should add alerting for ERROR and WARN early in development is that it will give you fast feedback on whether or not your ERROR and WARN logs are actually serious enough to cause a notification. Being alerted every time a user gets a 404 will become annoying quite quickly.

---

### Log Output Formats

- Compliance requirements (e.g. Audit Logs)
- It is common to use GUI-tools (e.g. kibana) to analyze logs
  → **structured logging**
- use machine-readable format, e.g.:
  - JSON
  - XML

```
2020-06-17 17:25:16 http-8080-6 INFO Service1.execute(120) userId:U1002 - Completed request
{"message":"The application started successfully.","level":"info"}
```

Notes:

- We should consider formatting the logs in JSON or XML to make it machine-readable
- JSON is a relatively compact serialization format that can be generated and parsed from almost any programming languages means it makes a great light weight interchange format
    - making it a great choice for a logging format
- Easily index and trace operations / transactions across multiple machines and software systems

---

### Common Mistakes / Pitfalls

- Too much: logs that provide little value, e.g. if point A in the code is always followed by point B, it can be enough to log at point B (possibly including information from A)
- Too little: Far more common. Especially applies to Failure modes. Will leave you guessing.
- Generic messages: Make the text in the message easy to search for.
- Screaming: The log messages should not contain any special characters to grab your attention. Use log levels to differentiate.

Notes:

- These are taken from [this](https://henrikwarne.com/2020/07/23/good-logging/) article.

---

# Questions?

# Distributed Logging - Reflection Points

---

## Distributed Logging

- In which situations is such a concept helpful - only in a Microservice solution?
- How can you adjust the solution to even correlate with logs on the client (e.g. Browser)?
- What happens if your correlation id approach is not consistent accross all your services (note e.g. [Wikipedia]() uses `x-correlation-id` as header, whereas e.g. [an SAP logging library](https://github.com/SAP/cf-nodejs-logging-support/) uses `x-correlationid`)?
- If your overall solution heavily relies on async communication, what is the impact on this concept?

Notes:

- *In which situations is such a concept helpful - only in a Microservice solution?* It is useful whenever you have a distributed system, it does not have to be a Microservice solution per se.

- *How can you adjust the solution to even correlate with logs on the client (e.g. Browser)*?
  - Before sending a request in the browser, you could generate a UUID and attach it as correlation id header.
  - In case there are several request-response cycles in a flow that involves the UI, you can also forward the correlation id from a response to the subsequent request.

- *What happens if your correlation id approach is not consistent accross all your services?*
  - not easy to solve, this needs to be discussed on a (sub-) organizational level with all affected parties
  - align with those parties and decide on one solution OR
  - make sure your service can recognize different correlation id header and map between them

- *If your overall solution heavily relies on async communication, what is the impact on this concept?*
  - If you  need to track down a bug it is harder to *reconstruct* the "error stack" compared to an in-process error stack.
  - Since there are several systems involved you can't be sure whether the order of the logged errors is correct - there is always a delay between the services due to async communication. Timestamps help in such cases but might not be 100% accurate.




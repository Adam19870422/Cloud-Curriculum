# Continuous Delivery - Reflection Points

---

## Continuous Delivery

- Can you test your pipeline? Do you need to? Local vs automated test environment?
- What needs to be done in a real-world pipeline? What are the pre-conditions for a useful pipeline?
- Who should take care of the pipeline and what does taking care mean to you in this context?   
- Consider you have one pipeline per microservice. What are the challenges you might face?
- How long do you think a pipeline run should take?

Notes:

- *Can you test your pipeline? Do you need to? Local vs automated test environment?* In general, a pipeline is hard to test programatically.
  - The point of a pipeline is to automate manual tasks.
  - The local environment should be as similar as possible to the production environment from the application setup perspective so you can run the same scripts to deploy your application locally vs in prod. They should only differ in configuration/environment
  - Even if you would test that certain commands were run you would not test their *behaviour* if they have side effects.
  - You could, however test small self-contained scripts with no side effects.
  - In general, a pipeline can only be tested manually.

- *What needs to be done in a real-world pipeline? What are the pre-conditions for a useful pipeline?* Some common pipeline stages are
  - *Build artifacts*
  - Tests: *Unit tests*, *Integration tests*, *E2E tests*, *Performance tests*
  - *Security & compliance scans*
  - *Deploy to prod*.

- Consider you have one pipeline per microservice. What are the challenges you might face?
  - You need to make sure that the changes of one microservices does not break the functionality of the overall application
  - One way to achieve this is via contract testing
  - However, there are still race conditions. Example: Two microservices  (MS1 & MS2) are deployed simultaneously. MS1 depends on MS2 and tests against the current API of MS2, but before it is fully deployed, MS2 already has a new, incompatible API (since the deployment happens to be faster). MS1 is deployed but the overall functionality breaks since MS2s API has changed without MS1 being notified. (Hint: There are also principles to avoid some of those problems, i.e. Zero downtime API migration, but the general problems remain)
- *How long do you think a pipeline run should take?* As short as possible to be able to fix bugs and have new changes reflected as fast as possible.
Rule of thumb (of course, it depends on the complexity of the service ;)): 15-20 minutes would be ideal but its usually hard to achieve.
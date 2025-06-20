# Scalability

<!-- TrackingCookie-->
{% with pagename="scalability" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-cn4l.md' %}
{% endwith %}

{% include 'snippets/disclaimer-work-in-progress.md' %}
## 🤔 Wait, but why?

## 🎯 Learning Objectives

In this module you will learn

- Decoupling Services 
- Eventual Consistency
- Auto Scaling


## 🧠 Theory

- Get on [overview](./resources/scalability.pdf){target=_blank} on the Cloud Native and DevOps concepts that help to achieve Scalability through loose coupling and eventual consistency.

- Great summary talk by Chris Richards on [Microservices Rules - what good looks like (40min + 40min Q&A)](https://video.sap.com/media/t/1_7b0hyi9h/145787301){target=_blank}

- In scaling application, databases usually are the bottleneck. THerefore, read about the [CAP theorem](https://en.wikipedia.org/wiki/CAP_theorem){target=_blank} and learn about the fundamental trade-offs if you are not already familiar with it. 

- Autoscaling


## 🏆 Case Study

!!! info "SAP Subscription Billing"
    See [interview](https://video.sap.com/media/t/1_u99agbs2/280073942){target=_blank} for details.
    Summary:
    - 5 Scrum teams for 12 Microservices (1:n) ownership, 1 Infrastructure team
    - Each service has own pipeline, each can deploy individually, daily deployment
    - Using eventual consistency + data duplication where it makes sense / is beneficial
    - Infrastructure team early helped develop pipelines, create monitors, enabled service teams later
    - DevOps on Duty approach, more ownership in the service teams overtime
    


## 🪞 Reflections

- What are the main dependencies for your product or organization?
- What strategies do you have to overcome those dependencies?
- What effects does tight coupling have on teamwork?
- Do we always have the need for immediate consistency (db transaction)?



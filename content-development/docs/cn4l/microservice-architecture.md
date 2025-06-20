# Microservice Architecture

<!-- TrackingCookie-->
{% with pagename="microservices-architecture" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-cn4l.md' %}
{% endwith %}

{% include 'snippets/disclaimer-work-in-progress.md' %}

## 🤔 Wait, but why?

>In short, the microservice architectural style is an approach to developing a single application as a **suite of small services**, each **running in its own process** and communicating with lightweight mechanisms, often an HTTP resource API. These services are **built around business capabilities** and **independently deployable** by fully automated deployment machinery. There is a **bare minimum of centralized management** of these services, which may be written in different programming languages and use different data storage technologies. (source:[James Lewis and Martin Fowler](https://martinfowler.com/microservices/){target=_blank})

The Microservice architecture pattern, if applied correctly and to the right scenarios, can enable you to build highly scalable cloud applications.

## 🎯 Learning Objectives

In this module you will learn

- the differences between *Monolith*, *Modular Monolith*, *Microservices* and *Distributed Monolith*
- how to get from Monolith to Microservices
- what the trade-offs are that teams need to consider

## 🧠 Theory

1. Consume the following materials:
    1. What are Microservices and what problems are we trying to solve?
        - Microservice intro: [slides](https://pages.github.tools.sap/cloud-curriculum/materials/cndj/cloud-microservices/slides/intro){target=_blank} ([with speaker notes](https://pages.github.tools.sap/cloud-curriculum/materials/cndj/cloud-microservices/slides/intro?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_axq1e495){target=_blank}
        - Service-to-Service communication: [slides](https://pages.github.tools.sap/cloud-curriculum/materials/leaders/service2service/slides/fundamentals){target=_blank} ([with speaker notes](https://pages.github.tools.sap/cloud-curriculum/materials/leaders/service2service/slides/fundamentals?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_kslnruyg){target=_blank}
    1. Are Microservices always a good Idea? What tradeoffs are we making?
        - Microservice reflection: [slides](https://pages.github.tools.sap/cloud-curriculum/materials/cndj/cloud-microservices/slides/reflection){target=_blank} ([with speaker notes](https://pages.github.tools.sap/cloud-curriculum/materials/cndj/cloud-microservices/slides/reflection?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_0k9hxsvu){target=_blank}



## 🏆 Case Study

1. Read the [story (5min)](https://dev.to/indika_wimalasuriya/amazon-prime-videos-90-cost-reduction-throuh-moving-to-monolithic-k4a){target=_blank} or watch the [video (17min)](https://youtu.be/J7ITgYBn_3k?t=10){target=_blank} on how the *Amazon Prime Video monitoring service* switched from a Microservices architecture to a Monolithic one and reduced cost by 90%.

## 🪞 Reflections

1. Which architecture pattern do think your team follows?
    - Microservices? Really? Can your team(s) deploy independently? Do they share a database or other centralized resources?
1. If you start a new product, what would be a better approach at the beginning?
    - Go straight to 20 Microservices
    - A Monolithic Architecture
1. What is your role in this, and how could you influence architecture decisions without outright telling your teams what to do?
1. How do you evaluate or measure whether your current architecture is a good fit or if it needs to be adapted?

## 💻 Technical Exercises

1. Explore the Developer Tools in a browser and technically analyze a website:
    1. Open new browser window
    1. Open "Developer tools"
        - e.g. for Chrome: Right-click anywhere in the browsers main window and choose "Inspect"
    1. Open the "Network" Tab in the Developer Tools
    1. Open an SAP app, e.g. "Fiori Launchpad"
    1. Analyze what resources took the longest to load
    1. Look around, and explore other dev tools tabs, e.g. elements, console, performance, application...

## ✏️ Non-Technical Exercises

1. Discuss the implications of your current architecture with your **learning partner or team**
    1. Does it allow you to scale sufficiently?
    1. Does it allow your teams to work independently of each other?
    1. Is it cost effective w.r.t running costs?

<!-- - TODO: Poll: which architecture / team setup do you have in your product area?  -->


## 📚 Recommended Reading

- Strategies to migrate from a Monolith: Read about the [Strangler Pattern (15min)](https://dzone.com/articles/monolith-to-microservices-using-the-strangler-patt){target=_blank}
- [Microservices.io](https://microservices.io/){target=_blank}

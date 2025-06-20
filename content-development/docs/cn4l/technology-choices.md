# Technology Choices

<!-- TrackingCookie-->
{% with pagename="technology-choices" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-cn4l.md' %}
{% endwith %}

{% include 'snippets/disclaimer-work-in-progress.md' %}

## 🤔 Wait, but why?

For every given technology problem, there are many different technologies and frameworks to help solve the problem, each with its own trade-offs.

- Having full *autonomy* to choose the technology that provides an optimal solution for a specific problem is ideal at a team level.
- Sometimes, the cost and effort of having too many different technologies and frameworks within a company, can heavily outweigh the benefits of locally optimal solutions, requiring *alignment* on these choices.

## 🎯 Learning Objectives

In this module you will learn:

- about some standard technologies
- why the initial selection and ongoing evaluation of technology choices are crucial for the success of cloud services
- why a good balance between autonomy and alignment is important

## 🧠 Theory

<!-- The images depicts our bulletinboard ads application. Technology choices happen on each layer:

- UI frameworks
- App/Server
- Databases
- Communication protocols  

<p align=center><a href="#-theory"><img src="../images/User.png" width=50px></a></p>
<p align=center>
<a href="../images/BrowserView_Ads.png"><img src="../images/communication-patterns-ads.png" width=300px></a><a href="../images/BrowserView_Reviews.png"><img src="../images/communication-patterns-reviews.png"width=300px></a>
<a href="#-theory"><img src="../images/communication-pattern-server-db.png" width=600px></a>
</p>

**REVISE: I find the above confusing at best... and not sure what we are trying to teach or motivate with this image.... For the bootcamp it makes sense... but here it is just noise from my point of view...
ISO/OSI layer wise SQL has nothing to do TCP OR HTTP which themselves are also at completely different layers (TCP->Layer 4, HTTP->Layer 7)
IF this is supposed to motivate then I would rather have a motivating image in the "Wait, but why section" above**
-->

1. Look into the basic concepts for:

    1. HTTP/REST: [slides](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/httpRest-slides/index.html){target=_blank} ([with speaker notes](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/httpRest-slides/index.html?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_nz6b500z){target=_blank}
    1. Databases: [slides](https://pages.github.tools.sap/cloud-curriculum/materials/leaders/persistence/slides/fundamentals){target=_blank} ([with speaker notes](https://pages.github.tools.sap/cloud-curriculum/materials/leaders/persistence/slides/fundamentals/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_ber4k7uz){target=_blank}


## 🏆 Case Studies


1. [Netflix Culture](https://jobs.netflix.com/culture){target=_blank}

    > "At Netflix, we aim to inspire and empower more than just manage because people can have a greater impact when they’re free to make decisions about their own work."

1. At SAP, the balance between autonomy and alignment for development has been achieved through the [Cross Product Architecture](https://pages.github.tools.sap/CPA/landing-page/){target=_blank} (CPA) working groups.
    - There, the guidance for the most strategic architectural topics has been agreed upon and documented in [technology guidelines](https://pages.github.tools.sap/CentralEngineering/TechnologyGuidelines/){target=_blank}.
    - SAP's "[North Star Architecture](https://sap.sharepoint.com/teams/NorthStarArchitectureIntegrationKernelServices/Shared%20Documents/General/North%20Star%20Architecture%20Strategy%20Papers/2022/North_Star_Architecture_2022.pdf?cid=476bf941-53b3-4bfc-a6d0-e3455d12e0d3){target=_blank}" provides guidance on when to choose which platform or setup based on these guidelines.

<!-- TODO: add case study for CAP testing ? (for empowerment vs alignment) -->

## 🪞 Reflections

1. Why does technology choice matter for teams?
1. What criteria are important for you when deciding which technologies to use?
1. Who makes the decisions when choosing technologies? Who should be involved in the decision process?
1. What are your challenges with regard to data storage, UI and development frameworks?
1. Do you perhaps need to adapt your technology choices?
1. What are the benefits and downsides of autonomy in technology choice?
1. What are the benefits and downsides of alignment in technology choice?

## 💻 Technical Exercises

1. **Choose a tool** from the list below so you can send requests to our API. Then **summarize advantages and disadvantages** for each of them, and **explain why** you chose the one you did.

    - [cURL](https://curl.se/){target=_blank} as a command line tool
    - [Postman](https://www.postman.com/downloads/){target=_blank}
    - [Insomnia](https://insomnia.rest/download){target=_blank}
    - [Bruno](https://www.usebruno.com/downloads){target=_blank}

1. Use your tool to `GET` the `ratings` for the user with the email `ok@example.com` from our *Bulletinboard Reviews* application.
    - The API description is available on the [root page](https://ad496250-65b4-4e16-bb26-55ab4e46763f:2cd7a62f-e789-447b-a9a1-ca8423f75b99@bulletinboard-reviews-cdf.cfapps.eu10.hana.ondemand.com/){target=_blank} of the service.
    - You can connect using the following credentials:

        |Key |Value |
        |---|---|
        |URL | https://bulletinboard-reviews-cdf.cfapps.eu10.hana.ondemand.com/ |
        |API_USER | ad496250-65b4-4e16-bb26-55ab4e46763f |
        |API_PASSWORD | 2cd7a62f-e789-447b-a9a1-ca8423f75b99 |

## ✏️ Non-Technical Exercises

1. Go Gemba and discuss **with your team(s)**:
    1. Which technologies and frameworks are used?
    1. If your team could freely choose which UI framework, persistence, or other technologies to use, what would they choose and why?



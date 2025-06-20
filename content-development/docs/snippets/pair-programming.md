
Pairing means that two developers write the code together.
Having a well informed discussion partner and your bad conscience sitting next to you helps you to take better decisions than you would do alone.
Constant knowledge transfer within the whole team is another benefit of practicing pair programming.

## 🎯 Learning Objectives

In this exercise you will learn

- how to work in pair programming mode
- how to setup your tool environment to effectively pair 
- how to use generative AI tools as pairing partner

## 🧠 Theory 

- General Concepts: [Pair Programming](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/pairProgramming-slides/index.html){target=_blank} ([with speaker notes](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/pairProgramming-slides/index.html?showNotes=true){target=_blank}) or the [recording](https://video.sap.com/media/t/1_mwlyi1fj){target=_blank}.

## 💻 Exercise

### 🚀 Getting Started

#### Pair Programming in virtual mode with colleagues
To collaborate with your pairing partner it is recommended to use one of the following tools:

- [Live Share](https://visualstudio.microsoft.com/services/live-share/){target=_blank} (VS Code)
- as a fallback option you can use the screen sharing feature of Zoom/Teams. However with that you have to take care of the handover yourself.

#### Setup to pair with an AI
Collaborating with a generative AI tool sounds strange at first but you can gain from it. It's easier because you do not need to schedule a meeting, but you need to make sure, you have the right license, be aware of any usage restrictions, and there might be cost involved. 
We have collected here a few possibilities: 

1. [SAP Playground](https://ai-playground.cfapps.sap.hana.ondemand.com/index.html){target=blank} for Large Language Models: Every colleague can use this playground for producing content based on input prompts in human language. It can access models from different vendors, e.g. Azure OpenAI, GCP. 
_Note: LLM's are stateless, i.e., they do not remember interaction unless the history is included in the subsequent prompt._ 
1. [SAP Digital Assistant](https://gpt-demo.cfapps.eu12.hana.ondemand.com/webclient/standalone/){target=blank}: this service provides an interactive experience that echoes the functionality of ChatGPT. It uses the GPT4 model provided by the [Azure OpenAI Service Proxy](https://github.tools.sap/I057149/azure-openai-service){target=blank}.
1. [GitHub Copilot](https://github.com/features/copilot){target=blank}: It is a real copilot integrated into your IDE (VS code and [IntelliJ](https://docs.github.com/en/copilot/getting-started-with-github-copilot?tool=jetbrains#prerequisites){target=blank}) which makes test or code suggestions. SAP will rollout GitHub Copilot between October 2023 and June 2024. We are currently working with IT to enable all learners to access Copilot in their IDE.<!-- Please use following instructions to create a GitHub.com account with your SAP e-mail address.  -->
1. [GitHub Copilot Chat](https://docs.github.com/en/copilot/github-copilot-chat/using-github-copilot-chat){target=blank}: Also integrated into your IDE (VS code only right now), Copilot chat can help understand code or make proposals. Right now Copilot chat is only available for early adopter tests. 

### 1 - Redo Unit Testing Exercise

We recommend to redo the unit testing exercise in [Java](../../unit-testing/java/){target=blank} or [Node.js](../../unit-testing/nodejs/){target=blank} using GitHub Copilot or any Large Language Model as pair programming partner. Try out the following: 

1. Provide a description for a requirement and ask Copilot or the LLM to write a unit test for it
1. Ask to write a test for a specific class or method or a selected code block
1. Check the code coverage and adjust your prompts to learn which prompts give better results. 
1. Try to refactor existing tests

### 2 - Reflect 
Reflect on what was helpful and what did not work, and how prompts influence the output. 
Capture your findings for yourself. 


## 🏁 Summary

Good job! In this unit you have learned:

* [x] how to work in pair programming mode
* [x] how to setup your tool environment to effectively pair 
* [x] how to use generative AI tools effectively as pairing partner

## 📚 Recommended Reading

- [AI at SAP - Overview Page](https://workzone.one.int.sap/site#workzone-notification?sap-app-origin-hint=&/groups/keCuBI5DeVY8ywOSb8UHHa/overview_page/gj3GDUtNun86VWwHld3kpo){target=blank}
- [Generative AI at SAP: Technology Strategy](https://dam.sap.com/mac/app/e/pdf/preview/embed/GNP4Qze?ltr=a){target=_blank}
- [GitHub Copilot: Prompts, tips, and use cases](https://github.blog/2023-06-20-how-to-write-better-prompts-for-github-copilot/){target=_blank}

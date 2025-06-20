# ASE Prerequisite Test for Node.js (TypeScript Version)

<!-- TrackingCookie-->
{% with pagename="prerequisite-test-nodejs" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-ase.md' %}
{% endwith %}

{% include 'snippets/node22-disclaimer.md' %}

## 🎯 Why?

<b>A</b>gile <b>S</b>oftware <b>E</b>ngineering (Node.js) is a training for Development roles which have good knowledge in Node.js and its ecosystem.

This little test, that should not take much time for a skilled programmer, gives you a first feedback if you have the required knowledge and skills to attend the training.

## 🤔 What if I don't know what to do or can't solve it?

If you don't have all the skills yet don't worry, you can learn them.

Have a look at the [basics](../../stack-basics/nodejs/){target=_blank}.

Also have a look at [Modern JavaScript Features](../../modern-lang-feat/javascript/){target=_blank}, [TypeScript](../../modern-lang-feat/typescript/){target=_blank} and [Asynchronous Programming](../../async/nodejs/){target=_blank}.

## 🧰 Technical Prerequisites

You will need a few things in order to work with the exercises.

The bare minimum is:

- [**Git** client](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

- [**Node.js** LTS (>=22) with **NPM** (>=9)](https://nodejs.org/en/download)

  - If you need to manage *multiple* versions of **`node`** and / or **`npm`**, consider using a [Node Version Manager](https://github.com/npm/cli#node-version-managers).

- **IDE** of your choice

  - We recommend [Visual Studio Code](https://code.visualstudio.com/) with [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig) and [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extensions installed for the best developer experience throughout the exercises.

## 💻 Exercise

{% include 'snippets/copilot-pretest-warning.md' %}

### What do I need to do here?

For this prerequisite test you have to implement a [`Developer`](#2-implement-the-developer-class) class and a [`hackathon`](#3-implement-the-hackathon-function) function.

To do so please follow the detailed steps below.

### 1. Clone Repository & Import

{% with branch_name="ase-pretest-ts", folder_name="ase-pretest-nodejs" %}
{% include 'snippets/clone-import/nodejs.md' %}
{% endwith %}

{% include 'snippets/install-dependencies/nodejs.md' %}


!!! hint "Git Errors"

    In case of any `Git` related error please have a look at our [**Git FAQ**](../../faq/git){target=_blank}

🚨 **Do not rename or move the files in this project** 🚨

### 2. Implement the Developer class

1. Implement and export an [Interface](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#interfaces) named `DeveloperInterface` in `src/lib/developer.ts` with the following contract:
    - Two getter methods `getName()`, and `getLanguage()` that return a `string`
    - The respective setter methods `setName(name: string)` and `setLanguage(language: string)` without return value (`void`)
    - A method called `code()`, which returns a `Promise` that resolves to a `string`

    ??? example "Need help?"
        A `Promise` that resolves to a type `T` is a generic of type `Promise<T>`


1. Create and export (default) a [Class](https://www.typescriptlang.org/docs/handbook/2/classes.html) `Developer` in file `src/lib/developer.ts` that `implements` the `DeveloperInterface` interface.

1. The `constructor` must accept two arguments `name` and `language` and assign them to private [class variables](https://www.typescriptlang.org/docs/handbook/2/classes.html#private). Both arguments should be of type [string](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#the-primitives-string-number-and-boolean).

1. Because of the interface, the class needs to provide the respective getter and setter functions for `name` and `language`. Implement them

1. Finally, the interface enforces the class to implement the `code()` method. The resolved [string](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#the-primitives-string-number-and-boolean) depends on the value of the `name` and `language` properties of the `Developer` instance:

    - `name`: `Nicole`, `language`: `nodejs`

      >`console.log("Hello, Nicole!")`

    - `name`: `John`, `language`: `java`

      >`System.out.println("Hello, John!")`

    - `name`: `Pete`, `language`: `python`

      > `print("Hello, Pete!")`

    - For any other `language`, e.g. `abap`, `swift`, `rust` etc., the returned [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) should **reject** with an [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) instance with a respective [message](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/message):

        - `Unsupported language: abap`

        - `Unsupported language: swift`

        - `Unsupported language: rust`

        - etc.

1. Run the tests 🧪 to verify your implementation: `npm run test:developer`

### 3. Implement the hackathon function

1. Create and export (default) an async function in file `src/lib/hackathon.ts`.

1. The function should accept a single argument `developers`, which is an [Array](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#arrays) of `DeveloperInterface` instances
(import the interface from `src/lib/developer.ts`).

??? example "Need help?"
    An `Array` where each element is of type `T` is a generic of type `Array<T>`

1. It should return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) which **resolves** with a single [string](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#the-primitives-string-number-and-boolean).

1. It should be the output of each individual call to `developer.code()` of the provided `developers` [Array](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#arrays), separated by a newline (`\n`), i.e. the last line should not end with a newline:

    >console.log("Hello, Nicole!") <br>
    System.out.println("Hello, John!") <br>
    print("Hello, Pete!")

1. If any call to `developer.code()` rejects with an [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error), that error must be caught and the error's [message](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/message) must be appended:

    >console.log("Hello, Nicole!") <br>
    System.out.println("Hello, John!")` <br>
    Unsupported language: abap <br>
    print("Hello, Pete!")

1. Run the tests 🧪 to verify your implementation: `npm run test:hackathon`

### 4. Commit and Push your Solution

{% with path_name="node/ase", language="Node.js", branch_name="ase-pretest-ts" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}


### 5. Check Results

After pushing to this repository as per the previous step, a build will be triggered that takes a few minutes to finish.

You will be informed via mail whether you have passed ✅ or failed ❌. In case of a failure the mail will provide some details about the errors. Don't worry: You have as many attempts as you need!


## 📣 Questions/Feedback

We value your feedback and your questions, and please use the teams channel [Learner Support: Cloud Native Developer Journey](https://teams.microsoft.com/l/team/19%3a0637dnZuwlGuuRXIm95UmDW1-DxvfNDqi4cLdYkA2Ho1%40thread.tacv2/conversations?groupId=6968a57a-9594-40de-b91c-d6b197057d01&tenantId=42f7676c-f455-423c-82f6-dc2d99791af7){target=_blank} to let us know!

💻 **Happy Coding** 💻

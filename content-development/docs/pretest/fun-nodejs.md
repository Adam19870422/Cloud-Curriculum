# FUN Prerequisite Test for Node.js (TypeScript Version)

<!-- TrackingCookie-->
{% with pagename="prerequisite-test-nodejs" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-fun.md' %}
{% endwith %}

{% include 'snippets/node22-disclaimer.md' %}

## 🎯 Why?

Cloud Development Fundamentals (Node.js) is a training for Development roles which have good knowledge in Node.js and its ecosystem.
This little test, that should not take much time for a skilled programmer, gives you a first feedback if you have the required knowledge and skills to attend the training.

## 🤔 What if I don't know what to do or can't solve it?

If you don't have all the skills yet don't worry, you can learn them.

Have a look at the [basics](../../stack-basics/nodejs/){target=_blank}.

Also have a look at [Modern JavaScript Features](../../modern-lang-feat/javascript/){target=_blank}, [TypeScript](../../modern-lang-feat/typescript/){target=_blank} and [Asynchronous Programming](../../async/nodejs/){target=_blank}.

## 🛠️ Technical Prerequisites

For this exercise you will require the following tools:

- IDE, we recommend [Visual Studio Code](https://code.visualstudio.com/) with [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig) and [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extensions.
- [Node.js](https://nodejs.org/en/) Please make sure to use the **latest LTS version 22**

  - If you need to manage multiple versions of `node` &/or `npm`, consider using a [Node Version Manager](https://github.com/npm/cli#node-version-managers)

- [Git client](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
{% include 'snippets/docker.md' %}

## 📗 Exercise/Test

### What do I need to do here?

For this prerequisite test you have to implement **two** small games and generate a checksum file:

- [Fizz Buzz Bingo](#2-implement-the-fizz-buzz-bingo)
- [Animal Race](#3-implement-the-animal-race)
- [Checksum](#4-generate-the-checksum-file)

To do so please follow the detailed steps below.

### 1. Clone Repository & Import

{% with branch_name="fun-pretest-ts", folder_name="fun-pretest-nodejs" %}
{% include 'snippets/clone-import/nodejs.md' %}
{% endwith %}

{% include 'snippets/install-dependencies/nodejs.md' %}


🚨 **Do not rename or move the files in this project** 🚨

### 2. Implement the Fizz Buzz Bingo

1. Create and export (default) a class called `FizzBuzz` in the file `src/lib/fizz-buzz.ts` which provides a single public method `evaluate(number: number): string`.
<!-- TODO: or adhere to interface? -->

1. Make sure the number is non-negative

    If a negative number is being passed as argument, the method should `throw` a generic [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) with message `"Invalid argument"`.

1. The `evaluate` method must behave as follows:

    - In case number is divisible by 3, the string `"Fizz"` should be returned.

    - In case the number is divisible by 5, the string `"Buzz"` should be returned.

    - For numbers that are divisible by 3 and 5, the string `"FizzBuzz"` should be returned.

    - All other numbers should be printed as strings (`"1"`, `"2"`, etc.).

    - If the previous result was **exactly** the same as the current one, append "Bingo" e.g.:
       
        ```typescript
        fizzBuzz.evaluate(3) // -> "Fizz"
        fizzBuzz.evaluate(9) // -> "FizzBingo"
        fizzBuzz.evaluate(1) // -> "1"
        fizzBuzz.evaluate(1) // -> "1Bingo"
        ```

1. Create sufficient tests cases for all of above scenarios in the provided `test/fizz-buzz.test.ts` file using the **[mocha](https://mochajs.org)** test framework and the **[assert](https://nodejs.org/docs/latest-v22.x/api/assert.html#assert)** module.

1. Run the tests 🧪 to verify your implementation: `npm run test:fizz-buzz`

    _Running the tests will also check for a 💯 percent code coverage and will fail if the coverage is below the required threshold._

### 3. Implement the Animal Race

1. Create and export (default) a single function in file `src/animal-race.ts`.

    - the function must accept a single argument `animals` that adheres to the interface `AnimalsInterface`, which is exported from file `src/api/animals.ts`.

    - use the methods provided by the interface `AnimalsInterface` to implement your race, e.g. calling `animals.rabbit()` will return a **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** which resolves with a string `'🐇'` after 1000 milliseconds (this is the time it takes for the `rabbit` to complete the race)

    - your function must return a **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** which resolves with an array of strings which represents the final placement of the animals competing in the race, e.g. `['🐇', '🐢', '🐌']`

    - However, the race is **staged** and the expected outcome of the race is:

      - the `snail` (`'🐌'`) must finish **1st** place

      - the `rabbit` (`'🐇'`) must finish **2nd** place

      - the `turtle` (`'🐢'`) must finish **3rd** place

    - Additionally the race **must not take longer than 3000 milliseconds** (plus a few milliseconds computing overhead).

      **Hint**: _all_ animals should run _concurrently_.

1. Run the tests 🧪 to verify your implementation: `npm run test:animal-race`

    _Running the tests will also check for a 💯 percent code coverage and will fail if the coverage is below the required threshold._

### 4. Generate the checksum file

In this step, simply run

```sh
npm run create-checksum
```

This will create a `checksum` file containing a hash. Leave it as it is - but don't forget to add it to your commit.

### 5. Commit and Push to personal Branch

{% with path_name="node/fun", language="Node.js", branch_name="fun-pretest-ts" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}


### 6. Check Results

After pushing to this repository as per the previous step, a build will be triggered that takes a few minutes to finish.

You will be informed via mail whether you have passed ✅ or failed ❌. In case of a failure the mail will provide some details about the errors. Don't worry: You have as many attempts as you need!


## 📣 Questions/Feedback

We value your feedback and your questions, and please use the teams channel [Learner Support: Cloud Native Developer Journey](https://teams.microsoft.com/l/team/19%3a0637dnZuwlGuuRXIm95UmDW1-DxvfNDqi4cLdYkA2Ho1%40thread.tacv2/conversations?groupId=6968a57a-9594-40de-b91c-d6b197057d01&tenantId=42f7676c-f455-423c-82f6-dc2d99791af7){target=_blank} to let us know!

💻 **Happy Coding**  💻

# Unit Testing

<!-- TrackingCookie-->
{% with pagename="unit-testing-nodejs" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

{% include 'snippets/node22-disclaimer.md' %}

## 🎯 Learning Objectives

In this exercise you will learn

- how to use basic Mocha annotations
- how to write Mocha tests for an existing codebase
- how to run Mocha tests in your IDE and evaluate the test coverage


## 🧠 Theory 

- General Concepts: [slides](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/unitTestDesign-slides/index.html?tags=nodejs){target=_blank} ([with speaker notes](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/unitTestDesign-slides/index.html?tags=nodejs&showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_dvpxmjco){target=_blank}
- Node.js Specific: [slides](https://pages.github.tools.sap/EngineeringCulture/ase/Nodejs/mocha-slides/index.html?tags=typescript){target=_blank} ([with speaker notes](https://pages.github.tools.sap/EngineeringCulture/ase/Nodejs/mocha-slides/index.html?tags=typescript&showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_kkhizs99){target=_blank}


## 💻 Exercise

It is your task to add unit tests for the class `NumberConverter`.

<!-- Prerequisites-->
{% with
  tools=[
    ('Optionally: [*coverage-gutters*](https://marketplace.visualstudio.com/items?itemName=ryanluker.vscode-coverage-gutters){target=_blank}')
  ],
  required=[
    ('Basic understanding of the [**ancient roman numerals system**](https://en.wikipedia.org/wiki/Roman_numerals){target=_blank}')
  ],
  beneficial=[
    ('[Typescript Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html){target=_blank}'),
  ]
%}
{% include 'snippets/prerequisites/nodejs.md' %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="unit-testing-ts", folder_name="unit-testing-nodejs" %}
{% include 'snippets/clone-import/nodejs.md' %}
{% endwith %}

{% include 'snippets/install-dependencies/nodejs.md' %}

{% include 'snippets/run-tests/run-tests-node.md' %}

    If the tests were successful you should see the following log in the console:

    ```logtalk
    ➜ npm test

    > exercise-code-nodejs@1.0.0 test
    > mocha

      Number converter
        ✔ passes an example test

      1 passing (6ms)
    ```

### 🔍 Code Introduction

- In `src/lib/number-converter.ts` you will find the class `NumberConverter` with the (only public) method `romanToArabic`, which takes a roman numeral as a parameter and, after conversion, returns an arabic integer.

- There is also an empty test stub in the corresponding test path `test/number-converter.test.ts` that:
    - groups tests that belong together in a `describe` block.
    - has a variable `numberConverter` that is instantiated in the function `beforeEach` - this means Mocha will automatically instantiate our class under test (`NumberConverter`), before the execution of each test.
    - contains a first simple *example test*, starting with `it(...)`, which verifies that the `numberConverter` variable is defined.
    - has [`assert`](https://www.chaijs.com/api/assert/){target=_blank} and [`expect`](https://www.chaijs.com/api/bdd/){target=_blank} imported from the [chai](https://www.chaijs.com/api/assert/){target=_blank} module. Simply choose the [assertion style](https://www.chaijs.com/api/){target=_blank} you prefer.

    !!! info "Write tests like specifications"
        Mocha uses "Behavior-Driven Development" (BDD) style in their API. This means tests read like specification - the "describe" and "it" blocks should form a sentence, in our case "Number converter passes an example test".

### 0 - Check Coverage

If you like, you can check the initial test coverage before we begin:

```sh
npm run coverage
```

The output should look like this:

```logtalk
➜ npm run coverage

> exercise-code-nodejs@1.0.0 coverage
> c8 --reporter=lcov --reporter=text mocha

  Number converter
    ✔ passes an example test

  1 passing (11ms)

---------------------|---------|----------|---------|---------|-------------------------------------
File                 | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s                   
---------------------|---------|----------|---------|---------|-------------------------------------
All files            |   43.42 |      100 |       0 |   43.42 |                                     
 number-converter.ts |   43.42 |      100 |       0 |   43.42 | ...55,58-59,62-63,66-67,70-71,74-75 
---------------------|---------|----------|---------|---------|-------------------------------------
```

You have several options to inspect the coverage:
- check the console output of your test run, it prints a coverage summary, mentioning lines which were not covered
- inspect the coverage html report which was generated in `/coverage/lcov-report/index.html` (open the index.html in browser)
- if you have a coverage plugin installed in your IDE, the coverage can also be displayed directly in the editor window

???info "Line Coverage vs. Branch Coverage"
    Line coverage measures the percentage of lines of code that have been executed during testing.
    It simply checks whether each line of code has been executed at least once.
    This metric tells you how much of your code has been tested, but it doesn't provide information about the different paths your code can take.

    Branch coverage, on the other hand, measures the percentage of branches or decision points in your code that have been executed during testing. 
    A branch is a point in your code where the program can take one of two or more paths based on a condition. 
    Branch coverage checks whether both the true and false branches of each decision point have been executed at least once. 
    This metric gives you a more detailed view of how well your code has been tested, as it captures the different paths your code can take.

Now let's write some tests!
**Execute the tests after each change you make**

### 1 - Single Roman Numerals

First, let's write some simple test cases for the "Happy Path".

1. Start with single digit roman numerals, here are some examples:
    - `I` should return `1`
    - `V` should return `5`
    - `M` should return `1000`

    ??? example "Need help?"

        A typical assertion within a test method might look like this:

        ```typescript
        const number = numberConverter.romanToArabic('X')

        // using assert
        assert.strictEqual(number, 10)

        // using expect
        expect(number).to.equal(10)
        ```

    !!! info "Naming conventions for unit test methods"
        A famous styles for naming tests that is often recommended is called `Given-When-Then`. However it doesn't quite fit to a spec-like style that Mocha uses. We can tweak it into a `Describe-Should-When` pattern:
        - `Describe` refers to the overall thing we want to test or the general context, put this in the `describe` block, such as `Number converter`
        - `Should` describes the expected behavior, put this at the beginning of the text in the `it('...')` that describes your test, such as `returns 42`
        - `When` describes the specific situation of the test, it completes the `it('...')` part, such as `...when passing XLII`
        - Check the [Mocha docs](https://mochajs.org/#hooks){target=_blank} for more info

    !!! info "Granularity of test methods"
        - You can either put multiple related assertions into one test method, or add several tests methods with one assertion each.
        - Both approaches are fine, as long as you don't bundle unrelated requirements (e.g. single digit roman numerals and subtractive numerals) into the same test method.
        - Keeping unrelated requirements separated keeps the tests small, and focused on one aspect, thus making them easier to read, maintain and understand.

1. Add more test cases until you feel comfortable!

### 2 - Invalid Numerals

As a next step, we want to test the most important "Error Paths".

- Add test cases that assert that `-1` is returned in case invalid parameters such as:
    - numerals that are not existing
    - empty strings
    - combinations of numerals that are not allowed

    are provided

### 3 - Additive and Subtractive Numerals

Now let's make it more complex: In the roman numeration, literals can be additive and subtractive.

1. Add some test cases for valid additive roman numerals, e.g.:
    - `II`
    - `VI`
    - `CXI`

1. Also add some test cases for valid subtractive roman numerals, like
    - `IV`
    - `XL`
    - `XC`

1. Add more test cases until you feel comfortable with your test suite for additive and subtractive numerals.

### 4 - Complex Numerals

1. If not done already, extend your test suite with test cases for more complex roman numerals, such as:
    - `XIV`
    - `CMXL`
    - `MMXXIII`
1. Once you've added a few cases, execute the tests with test coverage tracking again.
1. Have a look at the coverage report for `NumberConverter` and check if there are any chunks of code you have missed so far.
1. Think about relevant test cases to cover the missing code and add them. You may also add some more complex equivalent test cases to the previous steps.

!!! info "The Value of Test Coverage..."
    - A high test coverage doesn't automatically mean your test suite is sufficient, it is a great tool to help you to find the spots you've missed though.
    - Remember, high test coverage is a **necessary**, but **not a sufficient** identifier of a healthy codebase.
    - You could easily write tests to achieve high coverage without actually making any assertions about the outcome, thus testing nothing except that no exceptions are thrown. This is a behavior which can often be seen if Test Coverage is used as a KPI by management without granting the time/resources to actually do things right.
    - Use test coverage as what it is: a high level indicator, not a KPI.


## 🙌 Congratulations! Submit your solution.

{% with path_name="node/unit-testing", language="Node.js", branch_name="unit-testing-ts" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}

{% include 'snippets/line-vs-branch-coverage.md' %}

## 🏁 Summary

Good job! In this unit you have:

* [x] learned how to write tests in Mocha.
* [x] used your terminal to execute the tests.
* [x] improved the codebase by adding a test suite with sufficient coverage.

## 📚 Recommended Reading

- [Article on unit testing in the ASE Hub](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/unitTesting){target=_blank}
- [Mocha Documentation](https://mochajs.org/#hooks){target=_blank}

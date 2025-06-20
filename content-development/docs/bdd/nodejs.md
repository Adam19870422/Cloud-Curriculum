# Behavior Driven Development

<!-- TrackingCookie-->
{% with pagename="bdd-nodejs" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

## 🎯 Learning Objectives
In this exercise you will learn how to use acceptance criteria to drive the development.

## 🧠 Theory

- General Concepts: [slides](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/behaviourDrivenDevelopment-slides/index.html?tags=typescript){target=_blank} ([with speaker notes](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/behaviourDrivenDevelopment-slides/index.html?tags=typescript&showNotes=true){target=_blank})

## 💻 Exercise

In the following exercises we will implement a feature through acceptance test driven development (ATDD).
We will be writing the tests in a way that is close to natural language, so that (hopefully) people without knowledge of programming can understand them.

<!-- Prerequisites-->
{% with
  required=[
    ('[Typescript Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html){target=_blank}'),
  ],
  beneficial=[
	  ('[Mocha](https://mochajs.org){target=_blank}')
  ]
%}
{% include 'snippets/prerequisites/nodejs.md' %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="bdd-ts", folder_name="bdd-nodejs" %}
{% include 'snippets/clone-import/nodejs.md' %}
{% endwith %}

### 🔍 Code Introduction

The main entity of the code is the `Movie` class.
It consists of the fields `title`, `director` and `id`.

The movie entities can be persisted to an in-memory storage using the class `InMemoryMovieStorage`.
It provides methods to save, retrieve and delete movies.

Finally, we have the `MovieStore`-class, which shall serve as the interface for all users, but is not fully implemented yet.
   
### 1 - Implement Search by Title for Exact Matches

In the repository's `README.md` you can find a user story with two acceptance criteria.

#### 1.1 Write a Test for the First Scenario

In the file `test/movie-store.test.ts` there is a test with comments describing the first acceptance test.

1. Turn all the comments into syntactically valid TypeScript code, e.g.:
    ```typescript
    // Given two movies titled 'Forrest Gump' and 'Titanic'
    ```
    should become
    ```typescript
    givenTwoMoviesTitled('Forrest Gump', 'Titanic')
    ```

1. Create the new functions such as `givenTwoMoviesTitled` inside of the describe block.

1. Implement the methods using calls to `movieStore`'s methods.

    !!! tip "Save the result"
        The assertion(s) inside the method `thenTheResultsListConsistsOf` will need to access the result of the action performed in the `whenSearchMovieByTitle` method.
        We recommend creating a field in the describe block to hold the result.

1. Run the test and make sure it fails for the right reason (`MovieStore`'s methods are not implemented yet).

#### 1.2 Implement the MovieStore methods

1. Implement the method `addMovie` (that should accept a `movie` object as argument), using the `create` method of `InMemoryMovieStorage`.

1. Implement the `searchByTitle` method (which accepts a `query` string) to make the test pass.

### 2 - Implement Search by Title for Partial Matches
Take a look at the repository's `README.md` again and read the second scenario

#### 2.1 Write a Test for the Second Scenario

1. Create a new test in `test/movie-store.test.ts` and insert the second scenario from the `README.md` as a comment.
1. Turn the comments into valid TypeScript code, like you did for the first scenario

1. Run the test and make sure it fails.

#### 2.2 Make the Test Pass

Adjust the `searchByTitle` method, so that it returns a list of all movies whose title *includes* the query.

??? example "Need help?"
    You can check whether a string contains another string via the `includes` method

    ```typescript
    const stringValue = 'abcd'
    stringValue.includes('abc') // true
    stringValue.includes('abce') // false
    ```

## 🙌 Congratulations! Submit your solution.

{% with path_name="node/bdd", language="Node.js", branch_name="bdd-ts" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}

{% include 'snippets/line-vs-branch-coverage.md' %}

## 🏁 Summary
Good job!
In this exercise you wrote tests using domain language in a way that they are readable to non-developers.

## 📚 Recommended Reading
- [What is BDD?](https://www.agilealliance.org/glossary/bdd/){target=_blank}
- [Cucumber Introduction](https://cucumber.io/docs/guides/overview/){target=_blank}

## 🔗 Related Topic
- [ATDD](https://www.agilealliance.org/glossary/atdd){target=_blank}

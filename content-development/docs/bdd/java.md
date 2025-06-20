# Behavior Driven Development

<!-- TrackingCookie-->
{% with pagename="bdd-java" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

## 🎯 Learning Objectives

In this exercise you will learn how to use acceptance criteria to drive the development.

## 🧠 Theory

- [Slides](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/behaviourDrivenDevelopment-slides/index.html?tags=java){target=_blank} ([with speaker notes](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/behaviourDrivenDevelopment-slides/index.html?tags=java&showNotes=true){target=_blank})

## 💻 Exercise

In the following exercises we will implement a feature through acceptance test driven development (ATDD).
We will be writing the tests in a way that is close to natural language, so that (hopefully) people without knowledge of programming can understand them.

<!-- Prerequisites-->

{% with
  required=[
    ('[Spring](https://spring.io/){target=_blank}'),
    ('[Test-driven development](../../test-driven-development/java/){target=_blank}')
  ]
%}
{% include 'snippets/prerequisites/java.md' %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="bdd", folder_name="bdd-java" %}
{% include 'snippets/clone-import/java.md' %}
{% endwith %}

### 🔍 Code Introduction

The main entity of the code is the `Movie` class.
It consists of the fields `title`, `director` and `id`.

The movie entities can be persisted to an in-memory storage using the class `InMemoryMovieStorage`.
It provides methods to save, retrieve and delete a movie.

Finally, we have the `MovieStore`-class, which shall serve as the interface for all users, but is not fully implemented yet.

### 1 - Implement Search by Title for Exact Matches

In the repository's `README.md` you can find a user story with two acceptance criteria.

#### 1.1 Write a Test for the First Scenario

In the file `MovieStoreTest.java` there is a test with comments describing the first acceptance test.

1. Turn all the comments into syntactically valid Java code, e.g.:

    ```java
    // Given two movies titled "Forrest Gump" and "Titanic"
    ```
    should become
    ```java
    givenTwoMoviesTitled("Forrest Gump", "Titanic");
    ```

1. Create the new methods such as `givenTwoMoviesTitled` inside of the test class.

1. Implement the methods using calls to `movieStore`'s methods.

    !!! tip "Save the result"
        The assertion(s) inside the method `thenTheResultsListConsistsOf` will need to access the result of the action performed in the `whenIsSearched` method.
        We recommend creating a field in the test class to hold the result.

1. Run the test and make sure it fails for the right reason (`MovieStore`'s methods are not implemented yet).

#### 1.2 Implement the MovieStore methods

1. Implement the method `addMovie`, using the `save` method of `InMemoryMovieStorage`.

1. Implement the `search` method to make the test pass.

### 2 - Implement Search by Title for Partial Matches

Take a look at the repository's `README.md` again and read the second scenario

#### 2.1 Write a Test for the Second Scenario

1. Create a new test in `MovieStoreTest.java` and insert the second scenario from the `README.md` as a comment.
1. Turn the comments into valid Java code, like you did for the first scenario

    ??? tip "Variable Length Arguments"
        If you want a method two accept a variable amount of arguments you can use "varargs", by putting `...` after the parameter type:
        ```Java
        void oneOrMore(String... names) {
            assertThat(results).containsExactly(names);
        }

        oneOrMore("Alice");
        oneOrMore("Alice", "Bob");
        ```

1. Run the test and make sure it fails.

#### 2.2 Make the Test Pass

Adjust the `search` method, so that it returns a list of all movies whose title *contains* the query.

## 🙌 Congratulations! Submit your solution.

{% with path_name="java/bdd", language="Java", branch_name="bdd" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}

{% include 'snippets/line-vs-branch-coverage.md' %}

## 🏁 Summary

Good job!
In this exercise you wrote tests using domain language in a way that they are readable to non-developers.

## 🦄 Stretch Goal

You should already have a good idea of all common parts by now, you could stop here... oooor you can finish what you started:

- Rewrite your tests as `.feature`-files using [Cucumber-JVM](https://cucumber.io/docs/installation/java/){target=_blank}

## 📚 Recommended Reading

- [What is BDD?](https://www.agilealliance.org/glossary/bdd/){target=_blank}
- [Cucumber Introduction](https://cucumber.io/docs/guides/overview/){target=_blank}

## 🔗 Related Topic

- [ATDD](https://www.agilealliance.org/glossary/atdd){target=_blank}

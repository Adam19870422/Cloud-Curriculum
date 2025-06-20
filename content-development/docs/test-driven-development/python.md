# Test-Driven Development Basics

<!-- TrackingCookie-->
{% with pagename="tdd-python" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}


## 🎯 Learning Objectives

In this exercise you will learn

- how to develop software in a test-driven way

## 🧠 Theory

>TDD does make me go faster, improve my code, and my accuracy. (source: [Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2016/11/10/TDD-Doesnt-work.html){target=_blank})

- General concepts: [slides](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/testDrivenDevelopment-slides/index.html){target=_blank} ([with speaker notes](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/testDrivenDevelopment-slides/index.html?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_ewgojlvc){target=_blank}

## 💻 Exercise

Your task is to develop the game "FizzBuzz" in a test-driven manner.

<!-- Prerequisites-->
{% with
  required=[
      '[Pytest](https://docs.pytest.org/en/7.1.x/contents.html){target=_blank}'
  ]
%}
{% include 'snippets/prerequisites/python.md' %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="tdd", folder_name="tdd-python" %}
{% include 'snippets/clone-import/python.md' %}
{% endwith %}

{% with folder_name="tdd-python" %}
{% include 'snippets/python-create-use-virtual-env.md' %}
{% endwith %}

{% include 'snippets/install-dependencies/python.md' %}

{% include 'snippets/run-tests/run-tests-aggregate-python.md' %}

    If the tests were successful you should see the following logs in the console:

    ```logtalk
    ================================================= test session starts =================================================
    platform win32 -- Python 3.7.9, pytest-7.1.2, pluggy-1.0.0
    rootdir: C:\GIT_ROOT\ASE Python\exercise-code-python
    plugins: cov-3.0.0
    collected 1 item

    tests\test_fizzbuzz.py .                                                                                         [100%]

    ================================================== 1 passed in 0.12s ==================================================
    ```

### 🔍 Code Introduction

In `tests/test_fizzbuzz.py` you will find a prepared test class stub. There is also a corresponding productive class called `fizzbuzz.py`, but no productive code has been implemented yet.

### 1 - The Game FizzBuzz

Usually, FizzBuzz is a game played by children to learn division. You may also have a look at the  [Wikipedia article on FizzBuzz](https://en.wikipedia.org/wiki/Fizz_buzz){target=_blank}.  

In our case, the method which needs to be developed takes an integer number as a parameter

- In case it is divisible by 3, the String "Fizz" should be returned.
- In case the number is divisible by 5, the String "Buzz" should be returned.
- For numbers that are divisible by 3 and 5, the String "FizzBuzz" should be returned.
- All other numbers should be printed as Strings ("1", "2", etc.).

### 2 - The Basic TDD Cycle

Follow these steps to develop the functionality in a test driven way:

1. Add a test that asserts that the method `print` in class `FizzBuzz` returns `"1"` if the integer `1` is provided as a parameter.
1. Execute the test to see it is failing.
1. Write just enough productive code to make the test pass.
1. Add a second test that asserts that `print(2)` returns `"2"`. Run the tests to see the new test is failing.
1. Write just enough productive code to make both tests pass.
1. Think about possible refactorings. Can the code maybe be written in a simpler or more readable way?

    ??? example "Need help?"
        You may use `str()` to make your code simpler:
        ```python
        def print(input: int):
            return str(input)
        ```

1. If you applied a refactoring, execute the tests again to see that they stay green.
1. Add a third test that asserts that `print(3)` returns `"Fizz"` and add the necessary productive code.

### 3 - Develop the Game

You now know how to apply the TDD cycle to given requirements.

Proceed with test driven development to fulfill the following requirements:

1. `print(5)` should return `"Buzz"`.
1. `print(6)` and all other numbers divisible by 3 should return `"Fizz"`.
    
    ??? tip "Use the Remainder Operator to Check Whether a Number is Divisible by another"
        The [modulo operator](https://docs.python.org/3/library/operator.html#mapping-operators-to-functions){target=_blank} (`%`) returns the remainder of a division.

        ```Python
        assert 11 % 4 == 3
        ```

        If the remainder is 0 that means that the left-side argument is divisible by the right-side argument.

        ```Python
        assert 4 % 2 == 0
        ```

1. `print(10)` and all other numbers divisible by 5 should return `"Buzz"`.
1. `print(15)` should return `"FizzBuzz"`.
1. All numbers divisible by 3 AND 5 should give `"FizzBuzz"`.
1. All numbers that are not divisible by 3 or 5 should be printed as Strings.

If some requirements are too large to be covered by one unit test you may break them down into smaller test cases.

Remember to apply refactorings from time to time, but make sure the tests are green before starting to refactor.

## 🙌 Congratulations! Submit your solution.

{% with path_name="python/tdd", language="Python", branch_name="tdd" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}
{% include 'snippets/line-vs-branch-coverage.md' %}

## 🏁 Summary

Good job!
In the prior exercises you learned how to apply the ASE practice of test driven development.
You saw how you produced a well tested codebase with some simple steps.
Lastly, you could apply the technique of refactoring because you had confidence in your test suite.

## 📚 Recommended Reading

- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html){target=_blank}

## 🔗 Related Topics

- [What Is Refactoring](https://refactoring.guru/refactoring/what-is-refactoring){target=_blank}

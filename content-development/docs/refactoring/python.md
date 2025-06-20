# Refactoring

<!-- TrackingCookie-->
{% with pagename="refactoring-python" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

## 🎯 Learning Objectives

In this module you will

- learn how to perform many small refactorings while keeping the code functional
- identify issues with Clean Code principles
- practice using the ⌨️-shortcuts of your IDE to make your refactoring work more efficient

## 🧠 Theory

>Refactoring is a disciplined technique for restructuring an existing body of code, altering its internal structure without changing its external behavior. In essence when you refactor you are improving the design of the code after it has been written. (source: [Martin Fowler](https://refactoring.com/){target=_blank})

- CleanCode in Python: [slides](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/cleanCode-slides/index.html?tags=python){target=_blank} ([with speaker notes](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/cleanCode-slides/index.html?tags=python&showNotes=true){target=_blank}) or recording:
    - [Part 1](https://video.sap.com/media/t/1_yxe7g30f){target=_blank}
    - [Part 2](https://video.sap.com/media/t/1_xqq8gmsm){target=_blank}

- Refactoring: [slides](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/refactoring-slides/index.html?tags=python){target=_blank} ([with speaker notes](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/refactoring-slides/index.html?tags=python&showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_pod8oe6f){target=_blank}


## 💻 Exercise
In the following exercises we are going to refactor the `videostore` module.
This means we will improve the internal structure of the code **without changing its external behavior**.


<!-- Prerequisites-->
{% with
  tools=[
    ('[pytest-cov Coverage module](https://github.com/pytest-dev/pytest-cov/blob/master/README.rst){target=_blank}')
  ]
%}
{% include 'snippets/prerequisites/python.md' %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="refactoring", folder_name="refactoring-python" %}
{% include 'snippets/clone-import/python.md' %}
{% endwith %}


{% with folder_name="refactoring-python" %}
{% include 'snippets/python-create-use-virtual-env.md' %}
{% endwith %}

{% include 'snippets/install-dependencies/python.md' %}

{% include 'snippets/run-tests/run-tests-aggregate-python.md' %}

    The tests should all be passing ✅.
    That's the precondition before we start to refactor.

### 🔍 Code Introduction

The code that you have just checked out is a revised refactoring example (VideoStore) from Martin Fowler's book ["Refactoring"](https://martinfowler.com/books/refactoring.html){target=_blank}. It's a small, comprehensible program to practice some fundamental refactoring steps.

The code implements a solution for a video store to calculate and print a statement of a customer's charges. The program is told which movies a customer rented and for how long. It then calculates the charges, which depend on how long the movie was rented and what type of movie it is (regular, childrens, new release). It also calculates frequent renter points which vary by type of movie.

- `Rental` and `Movie` are simple data classes with data and accessors. 
- `Customer` is also a data class, but in addition it contains a `statement`-method that produces the statement. It is a big method, filled to the brim with if- and switch statements as well as calculations. Our refactoring efforts will largely focus on that method.

### 0 - Run Tests

Before we can start to refactor, we have to make sure we have a solid set of tests.
By executing the tests frequently as we refactor, we ensure that our changes didn't break the application.
Fortunately this code base already has a set of tests, so we can focus on refactoring 😉

!!! hint "A Good Craftsperson Knows His/Her Tools 👷‍♀️👷🛠️"
    Your IDE offers many useful refactoring utilities.
    It is **strongly recommended** to use them to make your refactorings more efficient, less tedious and less error-prone.
    You should strive to know the keyboard shortcuts, for the most used refactorings, by heart.
    
    The most used refactorings/actions during this exercise will be:

    - Rename method/variable
    - Extract method
    - Inline variable/method
    - Change signature
    - Move method
    - Run tests
    - Code inspections/apply quick code fixes

    Shortcut Cheat-Sheets: [VS Code Windows](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf){target=_blank} | [VS Code MacOS](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf){target=_blank} | [VS Code Linux](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-linux.pdf){target=_blank} | [PyCharm](https://www.jetbrains.com/help/pycharm/mastering-keyboard-shortcuts.html){target=_blank}

### 1 - Understand the Code 🧐

The code is not too complicated and the [Code Introduction](#code-introduction){target=_blank} might have helped you gain a basic understanding of the code already.
Nonetheless, it is essential that you fully understand the code you are going to restructure.

Go ahead and analyze the code of VideoStore, the tests are a good starting point to understand what the code does. Can you spot anything problematic about this code?

### 2 - Finding Proper Names

Let's start the refactoring by renaming things to have proper names.

1. Go to the `test_customer.py` test file.
    What is being tested here?
    The class under test is the `Customer`-class and the tests focus on the `statement`-method, which is also implied by the test-method names.
    You might wonder: "Why is this the `Customer`-class if it's mainly responsible for generating the statement?"
2. Perform some renamings: 
    1. Rename the `Customer`-class, the `customer.py` file and the `test_customer.py` test file to `Statement`, `statement.py` and `test_statement.py`.

        !!! caution "Update import"
            Don't forget to update the import in `test_statement.py` test file : 
            ```python
            from refactoring.statement import Statement
            ```

        !!! caution "Run the Tests"
            Don't forget to run the tests **after each single refactoring** that you do.
            This is the only way to ensure that we didn't break anything with our changes.
            Going forward we will no longer remind you of this.
            
    2. In `test_statement.py` extract the `Statement("Me")` into a pytest fixture, name it `statement` and use it in all test methods.
    3. Rename the `Statement.statement`-method to `Statement.generate`


### 3 - Decompose and Redistribute the `generate`-Method ✂️

#### 3.1 Break Down `generate`-Method

Time to tackle the long and complex `Statement.generate` method.
We will try to find logically related chunks of code and extract them into separate methods, in order to make the method more manageable.

1. The first two lines of the method clear/initialize the `__total_amount` and `__frequent_renter_points` variables.
    
    Extract the initialization into a method called `__clear_totals`

2. The name of the variable `result` isn't really revealing its purpose.

    Rename the `result`-variable to `statement_text`

3. The `generate`-method constructs the statement which can be thought of as three segments: header, rentals and footer.
    Let's extract those segments into separate methods.

    1. Extract the `statement_text = "Rental Record for ...` into a method called `header`

    2. Extract the for-loop into a method called `rental_lines`

    3. Extract the footer lines into a method called `footer`

    !!! hint "Extracted Method's Signatures"
        Please make sure that the methods do not take the resulting string as parameter.
        You can reduce the code complexity by creating a new String (called **rental_lines** and **footer** depending on the method) and returning it.
        The result of each method can be then appended to the `statement_text`-variable.

    ??? example "Need Help?"
        The resulting `generate`-method should look like this:
        ```PYTHON
            def generate(self):
                self.__clear_totals()
                statement_text = self.__header()
                statement_text += self.__rental_lines()
                statement_text += self.__footer()
                return statement_text
        ```

#### 3.2 Break Down `__rental_lines`-Method

We still have the method `__rental_lines` which is quite big.
Let's focus on breaking this down further.

1. The for-loop iterates over each rental, calculates the amount and frequent renter points, and finally generates the lines for a rental.

    Rename the `each`-variable to `rental`

2. Extract the body of the for loop into a method called `__rental_line`.
    The signature of method `__rental_line` should be `(self, refactoring.rental.Rental) -> str`.
    It returns the line for a rental which is then appended to the `__rental_lines`-variable in the `__rental_lines`-method.

3. Rename the `this_amount`-variable to `rental_amount` in the `__rental_line`-method.

#### 3.3 Break Down `__rental_line`-Method

Most of the code is now in the `__rental_line`-method. We can split it up into three separate methods:

1. The if/elif-statements determine the amount for a movie based on its type.
    Extract the if/elif-statements into a method called `__determine_amount`.
    The signature should look like `(self, rental: refactoring.rental.Rental) -> float`.
    It calculates and returns the amount for a rental.

2. Extract a method `__determine_frequent_renter_points`. 
    *Hint: Make the method calculate the frequent renter points and store them in a local variable instead of storing it in the class' field variable.
    Then return the calculated frequent renter points and add it to the field variable with `+=`.*
    The signature of method `__determine_frequent_renter_points` should look like `(self, rental: refactoring.rental.Rental) -> int`.

3. Extract the formatting of the line-string into a method called `__format_rental_line`.
    The signature of method `__format_rental_line` should look like `(self, rental: refactoring.rental.Rental, rental_amount: float) -> str`.

After these refactoring steps your `__rental_line`-method should look like this:

```PYTHON
    def __rental_line(self, rental: Rental) -> str:
        rental_amount = self.__determine_amount(rental)
        self.__frequent_renter_points += self.__determine_frequent_renter_points(rental)
        self.__total_amount += rental_amount
        return self.__format_rental_line(rental, rental_amount)
```

### 4 - Relocate Responsibilities 🗃️

We have broken the code into smaller pieces.
Now it's time to evaluate the responsibilities of each method.

#### 4.1 Moving from `Statement` to `Rental`

If you look at the `__determine_amount`- and `__determine_frequent_renter_points`-methods you will notice that they only depend on the rental.
Therefore we can move those methods to the `Rental`-class.

- Move the `__determine_amount`- and `__determine_frequent_renter_points`-methods to the `Rental`-class

The `__rental_line`-method should now look like this:

```PYTHON
    def __rental_line(self, rental: Rental) -> str:
        rental_amount = rental.determine_amount()
        self.__frequent_renter_points += rental.determine_frequent_renter_points()
        self.__total_amount += rental_amount
        return self.__format_rental_line(rental, rental_amount)
```

#### 4.2 Moving from `Rental` to `Movie`

We have moved the methods `determine_amount` and `determine_frequent_renter_points` to `Rental`.
It seems they are more dependent on `Movie` than on `Rental` (besides the `__days_rented`-variable).
Let's move them again, this time to the `Movie`-class.
But let us first adjust the code a little bit.

1. Inline the `get_days_rented` and `get_movie`-method in both `determine_amount`- and `determine_frequent_renter_points`-methods, so that you directly access the `__days_rented` and `__movie`-field instead of the accessor.

2. In the `determine_amount`- and `determine_frequent_renter_points`-methods, add a method parameter `days_rented` for each method.

3. Now add two **new** methods
    
    1. `def determine_frequent_renter_points(self) -> int`

    2. `def double determine_amount(self) -> float`

4. Inside these new methods call the respective methods by passing in the `__days_rented`-field as parameter, and return the result.

    ??? example "Need Help?"
        The newly added methods should look like this:
        ```PYTHON
        def determine_frequent_renter_points(self) -> int:
            return self.determine_frequent_renter_points(self.__days_rented)

        def determine_amount(self) -> float:
            return self.determine_amount(self.__days_rented)
        ```

5. Make sure that the methods `determine_frequent_renter_points(days_rented:int) -> int` and `determine_amount(days_rented:int) -> float` use the `days_rented`-parameter instead of `self.__days_rented`.

6. Move the methods `determine_frequent_renter_points(days_rented:int) -> int` and `determine_amount(days_rented:int) -> float` to the `Movie`-class.

7. In the `Movie`-class inline the `get_price_code()`-method.

### 5 - Replace Conditional Logic With Polymorphism

Finally it's time to take care of the nasty if/elif-statements. 
Imagine that we have to add more types of movies to our code, which means that these if/elif will grow further becoming more complex and harder to test.

In order to get rid of the if/elif-statements, we're going to create three new derivatives of the movie class and relocate the logic from each case to one of the new classes.

!!! hint "Take Baby Steps 👶"
    Refactoring in **baby steps** means we take small and safe steps, one after the other.
    After each step the tests must still be green, and we should be a little bit closer to our refactoring goal.
    Sometimes the steps will produce inadequate code, e.g. code duplication, but that's fine since these are only temporal states while we move towards our refactoring goal.

    Another approach to refactoring would be the **Big Bang refactoring**, where we'd attempt to apply many refactorings/changes at once.
    We won't follow this approach here.
    In [exercise 6](#6-big-bang-vs-baby-steps-reflection){target=_blank} we're going to look at some drawbacks of the Big Bang approach.

#### 5.1 A Little "Intentional Programming"

Let's adjust our tests: we're going to define how we expect our code to run in the tests, and adjust the productive code afterwards.

1. Go to your `test_statement.py`-class and have a look at the annotated `@pytest.fixture`-methods

    We're instantiating the variables with e.g. `Movie("RRRrrrr!!!", Movie.REGULAR)`.
    Notice that the type of movie (`Movie.REGULAR`) is passed in as parameter.
    It would be better if we could just instantiate the variable with the respective special type of movie.

2. Adjust the `@pytest.fixture`-methods to instantiate the variables with `RegularMovie(...)`, `NewReleaseMovie(...)` and `ChildrensMovie(...)`.
    The classes don't exist yet and your code won't compile, but we'll fix that in a minute.

3. Remove the second parameter since this information is redundant.

4. Create the missing subclasses `RegularMovie`, `NewReleaseMovie` and `ChildrensMovie`.

     Create matching files `refactoring/regular_movie.py`, `refactoring/new_release_movie.py`,`refactoring/childrens_movie.py` for these subclasses.

5. In the constructor call of the new classes you should call `super().__init__()` and pass in the `name`-variable and the respective type of movie.

    ??? example "Need Help?"
        E.g. the `RegularMovie`-class should look as follows: 
        ```PYTHON
        from refactoring.movie import Movie

        class RegularMovie(Movie):
            def __init__(self, name):
                super().__init__(name, Movie.REGULAR)
        ```

#### 5.2 Push Members Down ⬇️

In the `Movie`-class we have the method `determine_amount(days_rented:int)`. We want to implement this method in the subclasses and therefore we are going to push the methods down.

We also have the method `determine_frequent_renter_points(days_rented:int)` that could be implemented as an abstract method in the `Movie`-class and have it overridden by the `NewReleaseMovie` class.
??? example "Have abstraction in Python"
    ```PYTHON
    def MainClass:
        def pure_abstract_method(someparam):
            pass
        
        @abstractmethod
        def another_abstract_method(someparam):
            print("This is default behavior")
    
    def ChildClass(MainClass):
        def pure_abstract_method(someparam):
            print("I implement stuff")

        def another_abstract_method(someparam):
            super().another_abstract_method() # this is not mandatory
            print("This is specific behavior")
    ```

You can use the "Push (Members) Down" refactoring if you are using PyCharm as an IDE:

=== "Pycharm"
{% filter indent(4) %}
- Select the methods to be pushed down.
- From the main or context menu, choose **Refactor | Push Members Down**. Push Members Down dialog displays the list of members to be pushed down.
- In the Members to be pushed down area, select the methods you want to move.
{% endfilter %}

It is not possible yet to do this in Visual Studio Code when coding in Python...

#### 5.3 Refactor `__determine_amount`-Method

Within each subclass of `Movie` we are dealing with one specific type which makes the if-else-statements pointless.

1. Remove the unused cases in the if-else-blocks in each subclass.
    Run your tests with coverage to locate the cases that are not covered easily.
    
    === "Visual Studio Code"
{% filter indent(8) %}

{% with folder_name="refactoring" %}
{% include 'snippets/run-test-coverage/pytest-cli-test-coverage.md' %}
{% endwith %}
{% endfilter %}

1. Remove the if-else-statements completely and keep the remaining case.

2. Check if you can perform further refactorings e.g. **join declaration and assignments** and **inline variable**.
    Looks neat, doesn't it? 😉

#### 5.4 Refactor `__determine_frequent_renter_points`-Method

Let's refactor this method as well in each subclass of `Movie`.

1. Identify the obvious conditions in the `if`-statements, e.g.:
    - `(price_code == NEW_RELEASE)` will be always `false` within `RegularMovie`.
    - baby step 👶: substitute `(price_code == NEW_RELEASE)` with `false`

2. Simplify/remove the `if`-statements.

#### 5.5 Remove the Static MovieTypes and `price_code` 🎉

Due to the last few refactorings, the constants for the movie types (regular, childrens, new release), and the `price_code`-member variable are now obsolete and can be removed.

1. Use the **Change signature** refactoring on `Movie`-class' constructor to remove the `price_code` and then remove the assignment in the constructor body.


2. Remove the `price_code` and the constants for the movie types from the `Movie`-class.

### 6 - Big Bang 💥 Vs. 👶 Baby Steps (Reflection)

When refactoring, you often have a rough idea of how your code should look at the end.
Programmers then (often) tend to do a so called **Big Bang refactoring**.

In a Big Bang refactoring many changes are done at the same time.
Since the refactoring is bigger it will take a while until your code (hopefully) passes the tests again.
Chances are high that bigger refactorings will introduce new bugs. 
Doing small refactoring steps enables you to go back to the last functioning state without throwing all of your changes away.
Another downside is that Big Bang refactorings can be like labyrinths: The more you change the harder it gets to bring the code back to an acceptable state.

Therefore, always try to find the smallest useful change, do it, and validate it by running your tests.
If you made a mistake, it will be easy to find.
Since they are very small, you will have better control over your refactorings, and never get lost.

## 🙌 Congratulations!

{% with path_name="python/refactoring", language="Python", branch_name="refactoring" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}



## 🏁 Summary
Congratulations! 
You have successfully refactored the VideoStore codebase. 
Now it's easier to understand for your fellow developers but also more flexible for adjustments and incoming feature extensions.

## 📚 Recommended Reading
- [Uncle Bob refactoring the VideoStore](https://cleancoders.com/episode/clean-code-episode-3-sc-3-videostore){target=_blank} (sign up required)
- [Refactoring in very small steps](https://wiki.c2.com/?RefactoringInVerySmallSteps){target=_blank}
<!-- TODO: expand this list -->

## 🔗 Related Topics
- [Anemic Domain Model Anti-pattern](https://martinfowler.com/bliki/AnemicDomainModel.html){target=_blank}
<!-- TODO: expand this list -->

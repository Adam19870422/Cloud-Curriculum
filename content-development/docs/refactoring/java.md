# Refactoring

<!-- TrackingCookie-->
{% with pagename="refactoring-java" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

## 🎯 Learning Objectives

In this module you will

- learn how to perform many small refactorings while keeping the code functional
- identify issues with Clean Code principles
- practice using the ⌨️-shortcuts of your IDE to make your refactoring work more efficient

## 🧠 Theory

>Refactoring is a disciplined technique for restructuring an existing body of code, altering its internal structure without changing its external behavior. In essence when you refactor you are improving the design of the code after it has been written. (source: [Martin Fowler](https://refactoring.com/){target=_blank})

- CleanCode in Java: [slides](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/cleanCode-slides/index-principles.html?tags=java){target=_blank} ([with speaker notes](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/cleanCode-slides/index-principles.html?tags=java&showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_ljkfkbzr){target=_blank} 

- Refactoring: [slides](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/refactoring-slides/index.html){target=_blank} ([with speaker notes](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/refactoring-slides/index.html?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_pod8oe6f){target=_blank}

- Good practices : [slides](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/cleanCode-slides/index-howto.html?tags=java){target=_blank} ([with speaker notes](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/cleanCode-slides/index-howto.html?tags=java&showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_za91ixtc){target=_blank}


## 💻 Exercise
In the following exercises we are going to refactor the `videostore` module.
This means we will improve the internal structure of the code **without changing its external behavior**.


<!-- Prerequisites-->
{% with
  tools=[
    '[EclEmma Java Code Coverage Plugin](https://www.eclemma.org/installation.html#marketplace){target=_blank} (when using Spring Tool Suite)'
  ]
%}
{% include 'snippets/prerequisites/java.md' %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="refactoring", folder_name="refactoring-java" %}
{% include 'snippets/clone-import/java.md' %}
{% endwith %}

{% include 'snippets/run-tests/run-tests-aggregate-java.md' %}

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

    Shortcut Cheat-Sheets:
    
    - [IntelliJ](https://resources.jetbrains.com/storage/products/intellij-idea/docs/IntelliJIDEA_ReferenceCard.pdf){target=_blank}
    - [Eclipse](https://www.shortcutfoo.com/app/dojos/eclipse-win/cheatsheet){target=_blank}
    - [VS Code Windows](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf){target=_blank}
    - [VS Code macOS](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf){target=_blank}
    - [VS Code Linux](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-linux.pdf){target=_blank}

### 1 - Understand the Code 🧐

The code is not too complicated and the [Code Introduction](#code-introduction) might have helped you gain a basic understanding of the code already.
Nonetheless, it is essential that you fully understand the code you are going to restructure.

Go ahead and analyze the code of VideoStore, the tests are a good starting point to understand what the code does. Can you spot anything problematic about this code?


### 2 - Finding Proper Names

Let's start the refactoring by renaming things to have proper names.

1. Go to the `CustomerTest`-class.
    What is being tested here?
    The class under test is the `Customer`-class and the tests focus on the `statement`-method, which is also implied by the test-method names.
    You might wonder: "Why is this the `Customer`-class if it's mainly responsible for generating the statement?"
1. Perform some renamings: 
    1. Rename the `Customer`- and `CustomerTest`-classes to `Statement` and `StatementTest`

        !!! caution "Run the Tests"
            Don't forget to run the tests **after each single refactoring** that you do.
            This is the only way to ensure that we didn't break anything with our changes.
            Going forward we will no longer remind you of this.
            
    1. In `StatementTest` extract the `new Statement("Me")` into a field and name it `statement`
    1. Rename the `Statement.statement`-method to `Statement.generate`


### 3 - Decompose and Redistribute the `generate`-Method ✂️

#### 3.1 Break Down `generate`-Method

Time to tackle the long and complex `Statement.generate` method.
We will try to find logically related chunks of code and extract them into separate methods, in order to make the method more manageable.

1. The first two lines of the method clear/initialize the `totalAmount` and `frequentRenterPoints` variables.
    
    Extract the initialization into a method called `clearTotals`

1. The name of the variable `result` isn't really revealing its purpose.

    Rename the `result`-variable to `statementText`

1. The `generate`-method constructs the statement which can be thought of as three segments: header, rentals and footer.
    Let's extract those segments into separate methods.

    1. Extract the `String statementText = "Rental Record for ...` into a method called `header`

    1. Extract the for-loop into a method called `rentalLines`

    1. Extract the footer lines into a method called `footer`

    !!! hint "Extracted Method's Signatures"
        Please make sure that the methods do not take the resulting string as parameter.
        You can reduce the code complexity by creating a new String and returning it.
        The result of each method can be then appended to the `statementText`-variable.

    ??? example "Need Help?"
        The resulting `generate`-method should look like this:
        ```JAVA
            public String generate() {
                clearTotals();
                String statementText = header();
                statementText += rentalLines();
                statementText += footer();
                return statementText;
            }
        ```

#### 3.2 Break Down `rentalLines`-Method

We still have the method `rentalLines` which is quite big.
Let's focus on breaking this down further.

1. The for-loop iterates over each rental, calculates the amount and frequent renter points, and finally generates the lines for a rental.

    Rename the `each`-variable to `rental`

1. Extract the body of the for loop into a method called `rentalLine`.
    The method signature should be `private String rentalLine(Rental rental)`.
    It returns the line for a rental which is then appended to the `rentalLines`-variable in the `rentalLines`-method.

1. Rename the `thisAmount`-variable to `rentalAmount` in the `rentalLine`-method.

#### 3.3 Break Down `rentalLine`-Method

Most of the code is now in the `rentalLine`-method. We can split it up into three separate methods:

1. The switch-statement determines the amount for a movie based on its type.
    Extract the switch-statement into a method called `determineAmount`.
    The signature should look like `private double determineAmount(Rental rental)`.
    It calculates and returns the amount for a rental.

1. Extract a method `determineFrequentRenterPoints`.

    *Hint: Make the method calculate the frequent renter points and store them in a local variable instead of storing it in the class' field variable.
    Then return the calculated frequent renter points and add it to the field variable with `+=`.*
    The signature should look like `private int determineFrequentRenterPoints(Rental rental)`.

1. Extract the formatting of the line-string into a method called `formatRentalLine`.
    The signature should look like `private String formatRentalLine(Rental rental, double rentalAmount)`.

After these refactoring steps your `rentalLine`-method should look like this:

```JAVA
    private String rentalLine(Rental rental) {
        double rentalAmount = determineAmount(rental);
        frequentRenterPoints += determineFrequentRenterPoints(rental);
        totalAmount += rentalAmount;
        return formatRentalLine(rental, rentalAmount);
    }
```

### 4 - Relocate Responsibilities 🗃️

We have broken the code into smaller pieces.
Now it's time to evaluate the responsibilities of each method.

#### 4.1 Moving from `Statement` to `Rental`

If you look at the `determineAmount`- and `determineFrequentRenterPoints`-methods you will notice that they only depend on the rental.
Therefore we can move those methods to the `Rental`-class.

- Move the `determineAmount`- and `determineFrequentRenterPoints`-methods to the `Rental`-class

The `rentalLine`-method should now look like this:

```JAVA
    private String rentalLine(Rental rental) {
        frequentRenterPoints += rental.determineFrequentRenterPoints();
        double rentalAmount = rental.determineAmount();
        totalAmount += rentalAmount;
        return formatRentalLine(rental, rentalAmount);
    }
```


#### 4.2 Moving from `Rental` to `Movie`

We have moved the methods `determineAmount` and `determineFrequentRenterPoints` to `Rental`.
It seems they are more dependent on `Movie` than on `Rental` (besides the `daysRented`-variable).
Let's move them again, this time to the `Movie`-class.
But let us first adjust the code a little bit.

1. Inline the `getDaysRented` and `getMovie`-method in both `determineAmount`- and `determineFrequentRenterPoint`-methods, so that you directly access the `_daysRented` and `_movie`-field instead of the accessor.

1. At this point, rename the field variables `_daysRented` and `_movie` to `daysRented` and `movie`.
    We don't need the underscores.

1. In the `determineAmount`- and `determineFrequentRenterPoints`-methods, add a method parameter `int daysRented` for each method.

1. Now add two **new** methods
    
    1. `public int determineFrequentRenterPoints()`

    1. `public double determineAmount()`

1. Inside these new methods call the respective methods by passing in the `daysRented`-field as parameter, and return the result.

    ??? example "Need Help?"
        The newly added methods should look like this:
        ```JAVA
        public double determineAmount() {
            return determineAmount(daysRented);
        }

        public int determineFrequentRenterPoints() {
            return determineFrequentRenterPoints(daysRented);
        }
        ```

1. Make sure that the methods `int determineFrequentRenterPoints(int daysRented)` and `double determineAmount(int daysRented)` use the `daysRented`-parameter instead of `this.daysRented`.

1. Move the methods `int determineFrequentRenterPoints(int daysRented)` and `double determineAmount(int daysRented)` to the `Movie`-class. 

1. In the `determineAmount()` and `determineFrequentRenterPoints()` methods of the `Rental` class, call the new methods `determineFrequentRenterPoints(daysRented)` and `determineAmount(daysRented)` from the Movie class using `this.getMovie()`.

1. In the `Movie`-class inline the `getPriceCode()`-method.

1. In the `Movie`-class rename the `_title` and `_priceCode` in order to get rid of the underscores.

### 5 - Replace Conditional Logic With Polymorphism

Finally it's time to take care of the nasty switch-statement. 
Imagine that we have to add more types of movies to our code, which means that this switch will grow further becoming more complex and harder to test.

In order to get rid of the switch-statement, we're going to create three new derivatives of the movie class and relocate the logic from each case to one of the new classes.

!!! hint "Take Baby Steps 👶"
    Refactoring in **baby steps** means we take small and safe steps, one after the other.
    After each step the tests must still be green, and we should be a little bit closer to our refactoring goal.
    Sometimes the steps will produce inadequate code, e.g. code duplication, but that's fine since these are only temporal states while we move towards our refactoring goal.

    Another approach to refactoring would be the **Big Bang refactoring**, where we'd attempt to apply many refactorings/changes at once.
    We won't follow this approach here.
    In [exercise 6](#6-big-bang-vs-baby-steps-reflection) we're going to look at some drawbacks of the Big Bang approach.

#### 5.1 A Little "Intentional Programming"

Let's adjust our tests: we're going to define how we expect our code to run in the tests, and adjust the productive code afterwards.

1. Go to your `StatementTest`-class and have a look at the `setUp`-method

    We're instantiating the variables with e.g. `new Movie("RRRrrrr!!!", Movie.REGULAR)`.
    Notice that the type of movie (`Movie.REGULAR`) is passed in as parameter.
    It would be better if we could just instantiate the variable with the respective special type of movie.

1. Adjust the `setUp`-method to instantiate the variables with `new RegularMovie(...)`, `new NewReleaseMovie(...)` and `new ChildrensMovie(...)`.
    The classes don't exist yet and your code won't compile, but we'll fix that in a minute.

1. Remove the second parameter since this information is redundant.

1. Your IDE will offer to create the missing classes.
    Let the IDE create them for you. But make sure to create them in the correct directory: `src/main/java/com/sap/cc/videostore`.
    
    Make sure that the created classes extend `Movie`.

1. In the constructor call of the new classes you should call `super()` and pass in the `name`-variable and the respective type of movie.

    ??? example "Need Help?"
        E.g. the `RegularMovie`-class should look as follows: 
        ```JAVA
        public class RegularMovie extends Movie {
            public RegularMovie(String name) {
                super(name, Movie.REGULAR);
            }
        }
        ```


#### 5.2 Push Members Down ⬇️

In the `Movie`-class we have the methods `determineFrequentRenterPoints(int daysRented)` and `determineAmount(int daysRented)`.
We want to implement these methods in the subclasses and therefore we are going to push the methods down.

Use the "Push (Members) Down" refactoring of your IDE:
    
=== "IntelliJ"
    1. Use the **Push Members Down...** refactoring.
    1. Select both methods and check the **Keep abstract** checkbox.
    1. You might encounter an issue here: *member `priceCode` of `Movie`-class is not accessible*.
    1. Make the `priceCode`-member package-private by removing the access modifier (default is package-private).

=== "Spring Tool Suite"
    1. Use the **Push Down...** refactoring.
    1. In the "Push Down" dialogue, select both methods using the checkboxes.
    1. Mark both methods, and use the **Set Action** button to change the action for both methods to to **leave abstract declaration**
    1. Click `OK`
    1. You might encounter the warning "The visibility of field `com.sap.cc.videostore.Movie.priceCode` will be changed to protected". This is OK for us, click `Continue` to let the IDE do it's work.

#### 5.3 Refactor `determineAmount`-Method

Within each subclass of `Movie` we are dealing with one specific type which makes the switch-statement pointless.

1. Remove the unused cases in the switch-blocks in each subclass.
    Run your tests with coverage to locate the cases that are not covered easily.
    
    === "Spring Tool Suite"
{% filter indent(8) %}
{% include 'snippets/run-test-coverage/sts-run-test-coverage.md' %}
{% endfilter %}
    === "IntelliJ"
{% filter indent(8) %}
{% include 'snippets/run-test-coverage/intellij-run-test-coverage.md' %}
{% endfilter %}

1. Remove the switch-statement completely and keep the remaining case.

1. Check if you can perform further refactorings e.g. **join declaration and assignments** and **inline variable**.
    Looks neat, doesn't it? 😉

#### 5.4 Refactor `determineFrequentRenterPoints`-Method

Let's refactor this method as well in each subclass of `Movie`.

1. Identify the obvious conditions in the `if`-statements, e.g.:
    - `(priceCode == NEW_RELEASE)` will be always `false` within `RegularMovie`.
    - baby step 👶: substitute `(priceCode == NEW_RELEASE)` with `false`

1. Simplify/remove the `if`-statements.

#### 5.5 Remove the Static MovieTypes and `priceCode` 🎉

Due to the last few refactorings, the constants for the movie types (regular, childrens, new release), and the `priceCode`-member variable are now obsolete and can be removed.

1. Use the **Change signature** refactoring on `Movie`-class' constructor to remove the `priceCode` and then remove the assignment in the constructor body.

1. Remove the `priceCode` and the constants for the movie types from the `Movie`-class.

    !!! caution "The previous step is important to pass the validation workflow!"
        Finally, make sure the code coverage is at least 95% to pass the validation workflow. 

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

## 🙌 Congratulations! Submit your solution.

{% with path_name="java/refactoring", language="Java", branch_name="refactoring" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}

{% include 'snippets/line-vs-branch-coverage.md' %}

## 🏁 Summary
Congratulations! 
You have successfully refactored the VideoStore codebase. 
Now it's easier to understand for your fellow developers but also more flexible for adjustments and incoming feature extensions.

## 🦄 Stretch Goals

Ask yourself: Are you satisfied with the final structure of the code? The logic to determine frequent renter points and the amount is currently within the movie classes. Should the logic stay there? Maybe there is another entity hiding somewhere. Feel free to play around with the code and do some further refactoring steps.

## 📚 Recommended Reading
- [Uncle Bob refactoring the VideoStore](https://cleancoders.com/episode/clean-code-episode-3-sc-3-videostore){target=_blank} (sign up required)
- [Refactoring in very small steps](https://wiki.c2.com/?RefactoringInVerySmallSteps){target=_blank}
<!-- TODO: expand this list -->

## 🔗 Related Topics
- [Anemic Domain Model Anti-pattern](https://martinfowler.com/bliki/AnemicDomainModel.html){target=_blank}
<!-- TODO: expand this list -->

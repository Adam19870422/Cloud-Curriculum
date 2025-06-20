# Refactoring

<!-- TrackingCookie-->
{% with pagename="refactoring-nodejs" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

{% include 'snippets/node22-disclaimer.md' %}

## 🎯 Learning Objectives

In this exercise you will

- learn how to perform many small refactoring steps while keeping the code functional
- identify issues with Clean Code principles
- practice using the ⌨️-shortcuts of your IDE to make your refactoring work more efficient

## 🧠 Theory

>Refactoring is a disciplined technique for restructuring an existing body of code, altering its internal structure without changing its external behavior. In essence when you refactor you are improving the design of the code after it has been written. (source: [Martin Fowler](https://refactoring.com/){target=_blank})

- CleanCode in Node.js: [slides](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/cleanCode-slides/index-principles.html?tags=typescript){target=_blank} ([with speaker notes](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/cleanCode-slides/index-principles.html?tags=typescript&showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_5l9nas8e){target=_blank}
- Refactoring: [slides](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/refactoring-slides/index.html){target=_blank} ([with speaker notes](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/refactoring-slides/index.html?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_pod8oe6f){target=_blank}
- Good practices : [slides](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/cleanCode-slides/index-howto.html?tags=typescript){target=_blank} ([with speaker notes](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/cleanCode-slides/index-howto.html?tags=typescript&showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_or7dsmcz){target=_blank}

## 💻 Exercise

In the following exercises we are going to refactor the `videostore` module.
This means we will improve the internal structure of the code **without changing its external behavior**.

<!-- Prerequisites-->
{% with
  required=[
    ('[Typescript Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html){target=_blank}'),
  ],
  beneficial=[
      ('[Mocha](https://mochajs.org){target=_blank}'),
      ('[Istanbul](https://istanbul.js.org/){target=_blank}')
  ]
%}
{% include 'snippets/prerequisites/nodejs.md' %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="refactoring-ts", folder_name="refactoring-nodejs" %}
{% include 'snippets/clone-import/nodejs.md' %}
{% endwith %}

{% include 'snippets/install-dependencies/nodejs.md' %}

{% include 'snippets/run-tests/run-tests-node.md' %}

    The tests should all be passing ✅. That's the precondition before we start to refactor.


1. If you want to run the tests including a coverage report 📊 you can use the command

    ```shell
    npm run coverage
    ```

!!! hint "Check the README"
    Also check the `README.md` file for further information on how to get started with the project.

### 🔍 Code Introduction

The code that you have just checked out is a revised refactoring example (VideoStore 📼) from Martin Fowler's book *[Refactoring](https://martinfowler.com/books/refactoring.html){target=_blank}*. It's a small, comprehensible example to practice some fundamental refactoring steps.

The repository provides a `videostore` file to calculate and print a statement of a customer's charges. 
The module comprises classes for customer, movie, rental.

The `test` program is told which movies a customer rented and for how long. 
It then calculates the charges, which depend on how long the movie was rented and what type of movie it is (regular, children, new release). 
It also calculates frequent renter points which vary by type of movie.

- `Rental` and `Movie` are simple classes with data and getters. 
- `Customer` is also a class, but in addition it contains a `statement` method that produces the statement. 
    It is a big method, filled to the brim with if- and switch statements as well as calculations. 
    Our refactoring efforts will largely focus on that method.

### 0 - Run Tests

Before we can start to refactor, we have to make sure we have a solid set of tests.
By executing the tests frequently as we refactor, we ensure that our changes didn't break the application.
Fortunately this code base already has a set of tests, so we can focus on refactoring 😉

!!! hint "A Good Craftsperson Knows His/Her Tools 👷‍♀️👷🛠️"
    Your IDE offers many useful refactoring utilities.
    It is **strongly recommended** to use them to make your refactorings more efficient, less tedious and less error-prone.
    You should strive to know the keyboard shortcuts, for the most used refactorings, by heart.
    
    Shortcuts and Cheat-Sheets: 

    - VS Code:

        - [Refactoring](https://code.visualstudio.com/docs/editor/refactoring){target=_blank}

        - Shortcuts: 
            - [Windows](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf){target=_blank}
            - [macOS](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf){target=_blank}
            - [Linux](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-linux.pdf){target=_blank}

    - [IntelliJ](https://resources.jetbrains.com/storage/products/intellij-idea/docs/IntelliJIDEA_ReferenceCard.pdf){target=_blank}

The most used refactorings/actions during this exercise will be:

- Rename method/variable
- Extract method
- Inline variable/method
- Change signature
- Move method
- Run tests
- Code inspections/apply quick code fixes

!!! hint "Watch for changes in the code 👀"
    For convenience you can also run `npm run watch` to watch for code changes during your refactoring and run the tests automatically when any changes are being detected.

### 1 - Understand the Code 🧐

The code is not too complicated and the [Code Introduction](#code-introduction) might have helped you gain a basic understanding of the code already.
Nonetheless, it is essential that you fully understand the code you are going to restructure.

Go ahead and analyze the code of the `test/videostore.test.ts` file. The tests are a good starting point to understand what the code does. 

Can you spot anything problematic about this code?

### 2 - Finding Proper Names 🔤

Let's start the refactoring by renaming things to have proper names.

1. Go to the `test/videostore.test.ts` test file.

    What is being tested here?

    The class under test is the `Customer` class and the tests focus on the `statement` method, which is also implied by the test method names.

    You might wonder: *"Why is this the `Customer` class if it's mainly responsible for generating the statement?"*

1. Perform some renamings: 

    1. Rename the `Customer` class to `Statement` and the file `src/lib/customer.ts` to `src/lib/statement.ts`. 

        Don't forget to adjust the respective
        
        - `import` and `export` in `src/index.ts`
        - `import` in `test/videostore.test.ts`    

        !!! caution "Run the Tests"
            Don't forget to run the tests **after each single refactoring** that you do (~ `npm run watch`).

            This is the only way to ensure that we didn't break anything with our changes.

            Going forward we will no longer remind you of this.
            
    1. Rename the `Statement.statement` method to `Statement.generate`.


### 3 - Decompose and Redistribute the `generate` method ✂️

#### 3.1 Break Down the `generate` method

Time to tackle the long and complex `Statement.generate` method.
If you execute the following command: `npm run lint`, you will notice that the following error is raising:

```
 lint/complexity/noExcessiveCognitiveComplexity ━━━━━━━━━━

  × Excessive complexity of 12 detected (max: 10).
    16 │   }
    17 │
  > 18 │   statement(): string {
       │   ^^^^^^^^^
    19 │     this.totalAmount = 0
    20 │     this.frequentRenterPoints = 0

  i Please refactor this function to reduce its complexity score from 12 to the max allowed complexity 10.


Checked 8 files in 7ms. No fixes applied.
Found 1 error.
lint ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  × Some errors were emitted while running checks.
```

The linter is telling us that the statement method is too complex.
We will try to find logically related chunks of code and extract them into separate methods, in order to make the method more manageable.

1. The first two lines of the method clear/initialize the `totalAmount` and `frequentRenterPoints` variables.
    
    Extract the initialization into a private method called `clearTotals`.

1. The name of the variable `result` isn't really revealing its purpose.

    Rename the `result` variable to `statements`.

1. The `generate` method constructs the statement which can be thought of as three segments: `header`, `rentals` and `footer`.
    Let's extract those segments into separate methods.

    1. Extract the `statements = [ 'Rental Record for ...' ]` part into a private method called `header`.

    1. Extract the for-loop into a private method called `rentalLines`.

    1. Extract the footer lines into a private method called `footer`.

        !!! hint "Extracted Method's Signatures"
            Please make sure that the methods do not take the resulting array as parameter.  
            You can achieve this by creating individual `statements` variables in the respective method scopes.

            You can reduce the code complexity by simply concatenating the individual arrays using the [Array.concat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat){target=_blank} method **or** the [Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax){target=_blank}.
    
    1. Remove the temporary variables `statements` and `statement` and return the joined string directly.

    ??? example "Need Help?"

        The resulting `generate` method should look like this:

        ```typescript
            // using Array.concat
            generate(): string {
                this.clearTotals()
                return this.header()
                  .concat(this.rentalLines())
                  .concat(this.footer())
                  .join('\n')
            }

            // using Spread syntax
            generate(): string {
                this.clearTotals()
                return [
                  ...this.header(),
                  ...this.rentalLines(),
                  ...this.footer()
                ].join('\n')
            }
        ```

#### 3.2 Break Down `rentalLines` method

We still have the method `rentalLines` which is quite big.
Let's focus on breaking this down further.

1. The for-loop iterates over each rental, calculates the amount and frequent renter points, and finally generates the lines for a rental.

    Rename the `each` variable to `rental`.

1. Extract the body of the for-loop into a private method with the signature `rentalLine(rental: Rental): string`, so that it accepts a single `rental` as parameter and returns the line for a rental which is then appended to the temporary variable in the `rentalLines` method.

1. Rename the `thisAmount` variable to `rentalAmount` in the `rentalLine` method.

#### 3.3 Break Down `rentalLine` method

Most of the code is now in the `rentalLine` method. We can split it up into three separate methods:

1. The switch-statement determines the amount for a movie based on its type.

    Extract the switch-statement into a private method with the signature `determineAmount(rental: Rental): number`

    It calculates and returns the amount for a rental.

1. Extract a method `determineFrequentRenterPoints(rental: Rental): number`

    Make the method calculate the frequent renter points, but instead of storing them in the class' private field variable, store them in a local variable.
    Then add the returned number to the class' private instance field using the `+=` operator.

1. Extract the inline array with the formatted string into a private method called `formatRentalLine(rental: Rental, rentalAmount: number): string`.

After these refactoring steps your `rentalLine` method should look like this:

```typescript
  private rentalLine(rental: Rental): string {
    const rentalAmount = this.determineAmount(rental)
    this.frequentRenterPoints += this.determineFrequentRenterPoints(rental)
    this.totalAmount += rentalAmount
    return this.formatRentalLine(rental, rentalAmount)
  }
```


### 4 - Relocate Responsibilities 🗃️

We have broken the code into smaller pieces.
Now it's time to evaluate the responsibilities of each method.

#### 4.1 Moving from `Statement` to `Rental`

If you look at the `determineAmount`- and `determineFrequentRenterPoints` methods you will notice that they only depend on the rental.
Therefore we can move those methods to the `Rental` class.

1. Move the `determineAmount`- and `determineFrequentRenterPoints` methods to the `Rental` class.
  
    Make sure to remove the TypeScript `private` prefix to make them public methods.

    Don't forget to adjust the `MovieTypes` imports.

    Use the `this` context and remove the argument `rental` in both methods.

The `rentalLine` method should now look like this:

```typescript
  private rentalLine(rental: Rental) {
    const rentalAmount = rental.determineAmount()
    this.frequentRenterPoints += rental.determineFrequentRenterPoints()
    this.totalAmount += rentalAmount
    return this.formatRentalLine(rental, rentalAmount)
  }
```

#### 4.2 Moving from `Rental` to `Movie`

We have moved the methods `determineAmount` and `determineFrequentRenterPoints` to the `Rental` class with same signatures respectively.

It seems they are more dependent on `Movie` than on `Rental` (besides the `daysRented` variable).

Let's move them again, but this time to the `Movie` class.

But let us first adjust the code a little bit.

1. *Inline* the `getDaysRented` and `getMovie` method in both `determineAmount` and `determineFrequentRenterPoint` methods, so that you directly access the private `daysRented` and `movie` instance fields instead of the public getters.

1. In both the `determineAmount` and `determineFrequentRenterPoints` accept a single parameter `daysRented` of type `number` in each method. Afterwards, replace the `this.daysRented` inside the methods with the `daysRented` argument.

1. Now **make the two existing methods private** again (add `private`) and **create two new public methods**. You don't need to add a return type, the type will be `inferred` once we call the respective `private` function. (Typescript will complain because you cannot have two methods with the same name, but we will solve this in a moment.)
    
    1. `determineFrequentRenterPoints()`

    1. `determineAmount()`

1. Inside these new public methods call the respective private methods by passing in the private `this.daysRented` instance field as parameter, and return the result.

    ??? example "Need Help?"
        The newly added methods should look like this:
        ```typescript
        determineAmount() {
            return this.determineAmount(this.daysRented)
        }

        determineFrequentRenterPoints() {
            return this.determineFrequentRenterPoints(this.daysRented)
        }
        ```

1. Move the private methods `determineFrequentRenterPoints(daysRented: number): number` and `determineAmount(daysRented: number): number` to the `Movie` class. 

    But **in the `Movie` class** make them **public** again.

2. In the `Movie` class *inline* the `getPriceCode()` method.

3. In the `determineAmount()` and `determineFrequentRenterPoints()` methods of the `Rental` class, make sure to call the new methods `determineFrequentRenterPoints(daysRented)` and `determineAmount(daysRented)` from the Movie class using `this.movie`.

4. Remove the unused `import` for `MovieType` from the `Rental` class.

### 5 - Replace Conditional Logic With Polymorphism 👨‍👧‍👦

Finally it's time to take care of the nasty switch-statement. 
Imagine that we have to add more types of movies to our code, which means that this switch will grow further becoming more complex and harder to test.

In order to get rid of the switch-statement, we're going to create three new specialized subclasses of the movie class and relocate the logic from each case to one of the new subclasses.

!!! hint "Take Baby Steps 👶"
    Refactoring in **baby steps** means we take small and safe steps, one after the other.
    After each step the tests must still be green, and we should be a little bit closer to our refactoring goal.
    Sometimes the steps will produce inadequate code, e.g. code duplication, but that's fine since these are only temporal states while we move towards our refactoring goal.

    Another approach to refactoring would be the **Big Bang refactoring**, where we'd attempt to apply many refactorings/changes at once.
    We won't follow this approach here.
    In [exercise 6](#6-big-bang-vs-baby-steps-reflection) we're going to look at some drawbacks of the Big Bang approach.

#### 5.1 A Little "Intentional Programming"

Let's adjust our tests: we're going to define how we expect our code to run in the tests, and adjust the productive code afterwards.

1. Go to your `videostore` test file and have a look at the `before` hook

    We're instantiating the variables with e.g. `new Movie("RRRrrrr!!!", MovieType.REGULAR)`.
    Notice that the type of movie (`MovieType.REGULAR`) is passed in as parameter.
    It would be better if we could just instantiate the variable with the respective special type of movie.

1. Adjust the `before` hook to instantiate the variables with `new RegularMovie(...)`, `new NewReleaseMovie(...)` and `new ChildrensMovie(...)`.
    The classes don't exist yet and your tests won't run, but we'll fix that in a minute.

1. Remove the second parameter since this information is redundant.

1. Create the missing subclasses `RegularMovie`, `NewReleaseMovie` and `ChildrensMovie` extending the `Movie` class.

    Create matching files `src/lib/regular-movie.ts`, `src/lib/new-release-movie.ts` and `src/lib/childrens-movie.ts` for each subclass respectively.

1. In the constructor call of the new subclasses you should call `super()` and pass in the `title` variable and the respective `priceCode` (`MovieType`) of the movie.

    ??? example "Need Help?"
        E.g. the `RegularMovie` class should look as follows: 
        ```typescript
        export class RegularMovie extends Movie {
          constructor(title: string) {
            super(title, MovieType.REGULAR)
          }
        }
        ```

#### 5.2 Push Members Down ⬇️

In the `Movie` class we have the methods `determineFrequentRenterPoints(daysRented)` and `determineAmount(daysRented)`.
We want to implement these methods in the subclasses and therefore we are going to push the methods down.

1. Create the methods in each subclass respectively and copy the entire logic for now.

1. In the `Movie` class, make them `abstract` and add `number` as return type .

1. Make the `Movie` class `abstract`, that way no one will create an instance of it unintentionally.

#### 5.3 Refactor `determineAmount` method

Within each subclass of `Movie` we are dealing with one specific type which makes the switch-statement pointless.

1. Remove the unused cases in the switch-blocks in each subclass.
    Run your tests and check the coverage report to locate the cases that are not covered easily.
    
1. Remove the switch-statement completely and keep the remaining case.

1. Check if you can perform further refactorings e.g. **join declaration and assignments** and **inline variables**.
    Looks neat, doesn't it? 😉

#### 5.4 Refactor `determineFrequentRenterPoints` method

Let's refactor this method as well in each subclass of `Movie`.

1. Identify the obvious conditions in the `if`-statements, e.g.:
    - `(priceCode == MovieType.NEW_RELEASE)` will be always `false` within `RegularMovie`.
    - baby step 👶: substitute `(priceCode == MovieType.NEW_RELEASE)` with `false`

1. Simplify/remove the `if`-statements.

1.  Remove the argument `daysRented` from the `determineFrequentRenterPoints` method in `ChildrensMovie` and `RegularMovie`.

    !!! caution "The previous step is important to pass the validation workflow!"

#### 5.5 Remove the Static MovieType and `priceCode` 🎉

Due to the last few refactorings, the constants for the movie types (regular, children, new release), and the `priceCode` member variable are now obsolete and can be removed.

1. Change signature of the `Movie` class' `constructor` and remove the `priceCode` parameter and then remove the assignment to the `priceCode` instance field in the constructor body.

1. Remove the `priceCode` instance field and the constants for the `MovieType` from the `Movie` class.

1. Make the `title` instance field a private instance field by prefixing it `private title`.

1. Run `npm run coverage` to find unused code in your codebase. The `Movie` class methods should not be deleted, but you can remove the `getMovie` or `getDaysRented` methods in the `Rental` class (if not done already).

1. Finally make sure to also adjust all affected `export` and `import` statements in `src/lib/movie.ts`, `src/index.ts`, and `test/videostore.test.ts`.

    !!! caution "The previous step is important to pass the validation workflow!"
        Finally, make sure the code coverage is at least 95% to pass the validation workflow. 

### 6 - Big Bang 💥 Vs. Baby Steps 👶  (Reflection)

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

{% with path_name="node/refactoring", language="Node.js", branch_name="refactoring-ts" %}
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

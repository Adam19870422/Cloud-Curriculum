# Legacy Code

<!-- TrackingCookie: Not today-->
{% with pagename="legacy-code-java" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

## 🎯 Learning Objectives

In this exercise, you will learn how to work with legacy code by:

- adding `Characterization Tests`
- adding basic unit tests to easily testable code


## 🧠 Theory

  - General Concepts: [slides](../slides/fundamentals){target=_blank} ([with speaker notes](../slides/fundamentals/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_0kzg9sw0){target=_blank}

## 💻 Exercise

In the following exercise you will find a script to calculate the total cost for trips taken by customers.

Depending on the customer, various discounts are applied. What kind of discounts? - We don't know.
Maybe the tests can help us? Yikes! There are none 😱!

After many years of inactivity, a new requirement has surfaced: We want to have an additional discount rule based on the destination of the trip.

!!!warning "Stay on the Guided Path"
    You might be tempted to jump right into the code and start refactoring immediately because it is rather easy to understand how the code behaves, but please don't, as this will undermine your learning.
    Remember that the real world is often more complex than this exercise, and we are trying to teach you one of the many simple patterns to deal with *real* legacy code. As such, we will treat the exercise code as a black box: Adding tests, and extracting dependencies in a manner applicable to real-world legacy codebases.


<!-- Prerequisites-->
{% with
  required=[
    ('[Refactoring](../refactoring/java.md){target=_blank}'),
    ('[Decoupling](../decoupling/java.md){target=_blank}'),
  ]
%}
{% include 'snippets/prerequisites/java.md' %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="legacy-code", folder_name="legacy-code-java" %}
{% include 'snippets/clone-import/java.md' %}
{% endwith %}

### 🔍 Code Introduction

Checking the codebase, you can see there are several things being done:

- `Customer.java`: represents a customer
- `CustomerRepository.java`: reads customer data stored in a local database. The database file is located at `src/main/resources/db/customers.db`
- `Main.java`: parses the CLI inputs and wires everything together
- `TripCalculator.java`: performs calculations and logs the result to the console
- `Trips.java`: reads and parses csv files from the file system


### 1 - Add Characterization tests

Apparently, a colleague named Achim, who took the early retirement program, left some scenarios in the codebase that might explain how the code works. These are located in the `src/main/resources/trips` folder.

#### 1.1 Analyze Provided Scenarios Manually

1. Run `mvn clean package` to build the project

1. Execute `java -jar target/legacy-code-0.0.1-SNAPSHOT.jar 2025-01.csv`.

    You should see output similar to:

    ```logs
    $ java -jar target/legacy-code-0.0.1-SNAPSHOT.jar 2025-01.csv
    11:58:52.328 [main] INFO com.sap.cc.TripCalculator -- The total amount of money earned is: 94035.59
    ```

1. Note down the result `94035.59` together with the filename `2025-01.csv`, for the example above.

    We will need this information to create our tests.

1. Repeat the same process for the other 5 files in the `src/main/resources/trips` folder.
    
    Because this is a bit tedious, we have created a script called `run_scenarios.sh`, which you can execute as shown below:

    ```shell
    ./run_scenarios.sh
    ```
    It will execute the script for all files in the `trips` folder. You can then get the filename/result tuples from the output.

#### 1.2 Build a Safety Net Based on Existing Behavior

A `TripCalculatorTest` class already exists, but there aren't any tests! Let's create some, using the outputs of the previous step.

1. In `TripCalculatorTest.java` we obviously want to test `TripCalculator`, so import it and its dependencies, and wire them up.

    ??? example "Need help?"
        ```java
        package com.sap.cc;

        import org.junit.jupiter.api.BeforeEach;

        public class TripCalculatorTest {

          private TripCalculator testee;

          @BeforeEach
          void setUp() {
            CustomerRepository customerRepository = new CustomerRepository();
            Trips trips = new Trips();
            testee = new TripCalculator(customerRepository, trips);
          }
        }
        ```

1. The `calculate` method does not return a value, but simply logs the result using a `Logger` instance. To make reasonable assertions, we need a way to spy on this `Logger`.

    By inspecting the `pom.xml` we can see that `logback-classic` is used as the Logger implementation. This means we can register a custom Log-Appender to process log events, so:

    1. Create a new class called `SpyingAppender` in the `src/test/java` folder, based on the following code:

        ```java
        package com.sap.cc;

        import java.util.ArrayList;
        import java.util.List;

        import ch.qos.logback.classic.spi.ILoggingEvent;
        import ch.qos.logback.core.AppenderBase;

        public class SpyingAppender extends AppenderBase<ILoggingEvent> {

          private final List<String> logMessages = new ArrayList<>();

          @Override
          protected void append(ILoggingEvent eventObject) {
            logMessages.add(eventObject.getFormattedMessage());
          }

          public String getLastLogMessage() {
            return logMessages.isEmpty() ? "" : logMessages.get(0);
          }
        }
        ```

    1. In `TripCalculatorTest`, declare a private field of type `SpyingAppender` called `spyingAppender`
    1. Add the following code snippet to the `setUp` method

        ```java
        spyingAppender = new SpyingAppender();
        ch.qos.logback.classic.Logger logger = (Logger) org.slf4j.LoggerFactory.getLogger(TripCalculator.class);
        spyingAppender.setContext(logger.getLoggerContext());
        logger.addAppender(spyingAppender);
        spyingAppender.start();
        ```

        ??? info "Code Walkthrough"
            This code snippet:

            - Initializes the `spyingAppender`
            - Retrieves the `Logger` instance used by the `TripCalculator` class
            - Uses its `LoggerContext` to initialize the `spyingAppender`, so that it shares the logging context used by the `Logger`
            - Registers the `spyingAppender` with the `Logger` instance, so that it will receive log events
            - Starts the appender to begin recording log events.


        !!! info "Why not just refactor instead?"
            Instead of introducing this SpyingAppender, which is kind of hacky, we could of course have applied the 'dependency inversion' or 'pull up' refactorings for the logger, to make testing easier.

            But, as you hopefully remember, ***THE* fundamental rule for refactoring is: There need to be tests, and the tests must be green before refactoring**.
            So, no tests, no refactoring, period. We will get rid of this bulky construct pretty soon, so it won't bother us in the long run.


1. Add a test that `should calculate the total price of the trips for long term customers with few trips`, and:
    1. Call the `calculate` method with the argument `test_achim_long_term_customer_few_trips.csv`
    1. Use the `SpyingAppender`'s `getLastLogMessage()` to retrieve the last message that was logged
    1. `assertThat` the returned log message contains the String: `"The total amount of money earned is: 11590.95"`

    ??? example "Need help?"
        ```java
        @Test
        void calculateShouldCalculateSomething() {

          testee.calculate("trips_file.csv");

          String result = spyingAppender.getLastLogMessage();
          assertThat(result).contains("Expected Result");
        }
        ```

1. Provide test cases for all other files inside the `trips` folder, using the same pattern.

1. Run the tests by executing `mvn clean verify`. They should pass.

### 2 - The Dependencies need to be tested too!

If we notice small units that are easy to test, we should test them, even if it doesn't increase our test coverage. Let's enhance our test safety net by adding tests for the `Trips` and `CustomerRepository` classes.

#### 2.1 Test the `Trips` class

1. Create a test class called `TripsTest` in the same package as the `TripCalculatorTest` class and add the boilerplate for `Trips`.

1. Create a directory called `trips` in the `src/test/resources` folder

1. Create a file called `example.csv`, in the `trips` folder you just created, containing test data similar to the content of the existing CSV files, e.g.:

    ```csv
    CustomerId,Destination,Price
    da3fafb9-b299-4828-a923-ba30463708c1,DE,3609
    b0f52df1-9165-42bb-8d52-867a2007c0ff,FR,4869
    ```

1. Add a test case called `testShouldReadTripDataFromACSVFile` that:
    1. Reads the `example.csv` file by calling the `Trips` class's `readFromCsv(FILENAME)` method
    1. Verifies that the returned rows match the ones in the file

    ??? example "Need help?"
        ```java
        String[] result = trips.readFromCsv(FILENAME);
        assertThat(result).hasSize(EXPECTED_SIZE);
        assertThat(result[0]).isEqualTo(DATA_ON_LINE_ONE);
        assertThat(result[1]).isEqualTo(DATA_ON_LINE_TWO);
        ```

1. Add another test case called `testShouldThrowAnExceptionWhenReadingFromAFileFails`, which verifies that an `IOException` is thrown if the file does not exist.

    ??? example "Need help?"
        ```java
        assertThatThrownBy(() -> testee.methodFails()).isInstanceOf(EXPECTED_EXCEPTION_CLASS);
        ```

1. Run the tests. They should all pass.

#### 2.2 Test the `CustomerRepository` class

The `CustomerRepository` class reads from a database, which is a black box for us - we neither know what data is inside, nor how it is structured.
Because of this, we can only add very basic test cases, such as checking that the count of returned customers is correct. These tests have value nonetheless.

1. Create a test class called `CustomerRepositoryTest` in the same package as the other test classes and add the boilerplate for `CustomerRepository`.

1. Add a test case called `testShouldReturnCustomersByProvidedIds` that:

    1. Calls the `CustomerRepository` class's `getCustomers(String... ids)` method with two valid `ids` (which can be taken from one of the csv files in the `trips` folder)

    1. Verifies the count of the returned array matches the number of *valid* `ids` passed as method parameter

    ??? example "Need help?"
        ```java
        List<Customer> customers = customerRepository.getCustomers("94e5135a-49c5-4152-a1b0-b579ddbf7e63", "fa44e45e-dcff-4e48-81de-ec2be8c16d64");
        assertThat(customers).hasSize(EXPECTED_LENGTH_OF_RETURNED_CUSTOMERS);
        ```

1. Add a test case called `testShouldReturnEmptyIfParamEmpty` that:
    1. Calls getCustomers with no parameters (which is possible as it is a vararg)
    1. Expects an empty list as return value

1. Run the tests. They should all pass.

### 3 - Improve Testability
We can improve testability by making the inputs and outputs of our methods more explicit, and reducing dependence on the runtime environment or side effects.

#### 3.1 Extract the Log Statement

As the `calculate` method does not return the calculation result, we currently need to *spy* on the logs written to the `Logger` (which are merely a side effect of the method), in order to verify the calculation is correct.

To make testing easier, we will 'pull up' the `logger.info` invocation from the `TripCalculator.calculate(...)` method into the `Main` class.
This will simplify our test cases, allow us to delete the `SpyingAppender`, and eliminate the noisy log outputs during test execution.

1. Change the return type of `calculate` to `double`.

1. Set `total / 100` as the return value of the `calculate` method.

1. In case an `Exception` was caught return `0.0`.

1. Add a `private static` `Logger` to the `Main` class.

    If you are not familiar with loggers and their initialization, check how it is being done in `TripCalculator`. Just remember to update the class name in the call to `getLogger(...)`

    !!!info "Why static"
        Because the `main` method of the `Main`class is a static method, we need a static `Logger`instance.

1. Move the `logger.info` statement from the end of the `calculate` function, to the `Main` class' `main` method.

1. In `main`, pass the return value of the call to the `calculate` method to the `logger.info` statement.

1. Adjust the tests accordingly. 

    Instead of asserting the string value intercepted by the `SpyingAppender`, check that the numeric value returned by `calculate` is correct.

    ??? example "Need help?"
        ```java
        double result = calculator.calculate(FILENAME);
        assertThat(result).isEqualTo(EXPECTED_VALUE);
        ```

1. Remove the `SpyingAppender` class and all related code in the tests, as they are no longer needed.

1. Run the tests. They should all pass.

#### 3.2 Mock the File System Access

The file system dependency makes it hard to test, let's mock it away to improve the situation in the `TripCalculator` test suite.

1. Create a class named `Fixtures` in the same package as the other test classes, containing the snippet below:

    ```java
    public static final String[] data202501 = new String[] { 
        "94e5135a-49c5-4152-a1b0-b579ddbf7e63,DE,3487",
        "e12f8610-bfbe-4df4-a5d9-67b08a0560ad,HU,245", 
        "f3d0695d-f242-4b3f-92d1-bd07585bc60b,RO,1466",
        "f439c42e-eb22-426e-9dc5-f85fef917de5,FR,677", 
        "f4536e80-9178-4f6b-854f-9414904bf585,CZ,2632",
        "f46a9ea6-4bac-43bb-ba00-5d816bf24810,AT,1291", 
        "f4b881b8-d9ab-497f-b121-0677359787ff,CH,3453",
        "f4c203e5-726a-4300-a4a4-29f552e15dde,IT,2986", 
        "f50ea65c-33e1-4f84-a036-e47a398dcd95,GR,614",
        "f546fb98-fd18-46b1-97e4-7bd67fa934f4,SK,3031", 
        "f57bb305-eaa2-4d96-b0f6-0debea7024fe,DE,2005",
        "f67fd829-637d-4974-a354-c04b7aa23bef,CZ,995", 
        "f6b47228-4e06-4394-850f-6073ab6d0b09,NO,3410",
        "f7abb293-cad3-4711-bca9-d629907c15d5,FR,3874", 
        "f81b9d53-af00-453f-b623-45dc5747c344,GR,3957",
        "f84b7dcf-8f01-4bd5-bfe0-b5d7bf9afa46,HU,4884", 
        "f8d0deab-d6f6-4678-8541-8512c89f2c11,AT,1739",
        "f96b14b2-5866-4633-9dbf-94327c6612db,ES,3029", 
        "fa44e45e-dcff-4e48-81de-ec2be8c16d64,DK,862",
        "fa5d2c0a-e054-4fa3-b427-e796ca658103,BE,1974", 
        "fa931578-1d7e-4b4c-82ce-9f905bede587,BE,780",
        "fa97888a-aff9-40a9-b801-5b6711ac1ba8,PL,177", 
        "facd506d-8264-4ee1-ae29-d3afaf3e10dd,DE,1340",
        "fad2acf5-c179-48fe-8614-1c8a0d7e2fcd,HU,1889", 
        "fb862795-4ad9-4907-8824-bf4937e39347,GR,2333",
        "fbb830b8-892d-4c28-8e9c-b34c436ea8f9,FI,3291", 
        "fc1db200-d61d-48ff-81fd-cd1091945284,PT,896",
        "fcae2a63-3c7d-4d20-85f2-bd30f04f591c,IT,4154", 
        "fd1872e9-7c55-48d4-b9eb-f0493fe007e4,DK,4498",
        "fd47bfdf-f1ef-4257-a204-02cb8c612531,FI,1126", 
        "fd906247-adee-4023-9780-df07078aa23d,SK,2602",
        "fda49ce6-63f6-4463-8da8-61af996c8df9,DE,4864", 
        "fdc5a2c3-d778-486b-929f-4c425e7ab36f,DE,4626",
        "fdefd60c-5c11-43cf-af45-01ce9a3610b4,NO,4028", 
        "fe3814d5-2018-4777-a99d-e7af1a0b3f7f,FR,971",
        "fe69786b-fa35-4145-923a-77c03b3b6ed3,RO,2635", 
        "ff119c0b-a426-4d14-8a48-00a791ff9182,ES,788",
        "ff650708-e84e-44d4-9f02-e90bc05f4862,FR,2409", 
        "ff912c27-a50f-4c04-b647-bc1fc4012f2e,GR,2921",
        "ff987c10-188d-4037-a7bb-c9ed75fa4a08,PT,3653", 
        "ffe1cf9c-58f4-4dc6-b481-6bbaf38ce094,ES,2098" };

    public static final String[] dataLongTermCustomerFewTrips = new String[] {
        "da18d797-6c3f-4664-a3a5-b106124d80ef,NL,3835",
        "2949575f-b69a-47e7-8cd8-daa45e6719db,GR,299",
        "3938c9ea-5ecb-4e3a-a20a-4ec652b0e4c9,CZ,761",
        "25d8d481-4b33-419d-bd3a-40a9a449b5d6,PT,3743",
        "4eac6e39-e97a-4b95-a11e-9e948d967202,HU,3563"
    };

    public static final String[] dataLongTermCustomerManyTrips = new String[] {
        "da3fafb9-b299-4828-a923-ba30463708c1,DE,3609", 
        "b0f52df1-9165-42bb-8d52-867a2007c0ff,FR,4869",
        "01f8c851-2fd2-48d3-a8a9-d4f9cab270c1,ES,2454", 
        "34bc1369-1c98-410f-a8ed-5dc909316fb2,IT,3742",
        "0f61a590-8c9f-4357-8092-0bacc59857a8,PL,1787" };
    
    public static final String[] dataShortTermCustomerFewTripsDuplicates = new String[] {
        "3c60c377-3641-4641-a7fd-99571d2ff44a,CH,1874", 
        "3e570b5b-48c1-4a92-9c25-b3da13c112a8,SK,2325",
        "d47ccce7-fa89-4487-9025-9017ea10d121,NO,2562", 
        "b69ae032-d82c-4b5b-a3be-b75d6e8d1712,DE,1357",
        "b69ae032-d82c-4b5b-a3be-b75d6e8d1712,ES,1515" };

    public static final String[] dataShortTermCustomerFewTrips = new String[] {
        "3c60c377-3641-4641-a7fd-99571d2ff44a,CH,1874", 
        "3e570b5b-48c1-4a92-9c25-b3da13c112a8,SK,2325",
        "d47ccce7-fa89-4487-9025-9017ea10d121,NO,2562", 
        "b0b07107-332a-423c-bdfb-e057c1b85f7f,DE,1357",
        "b69ae032-d82c-4b5b-a3be-b75d6e8d1712,ES,1515" };

    public static final String[] dataShortTermCustomerManyTrips = new String[] {
        "a7d758eb-d4b5-44f8-8517-54c54e2d20d5,BE,349", 
        "839c01c8-cfe0-4b89-8298-0a7020af0077,SE,645",
        "03ac579e-9d0f-4e9e-b2e4-5f0f6421889c,AT,2897", 
        "50c02c51-7b01-424d-aecb-7d43662b2394,BG,3241",
        "df248791-1908-4f5e-bf2d-6a3b2d7c4fb3,DK,1930" };
    ```

    !!!info "What is this?"
        The fixtures above are the outputs of the `readFromCsv` method for all files in the `src/main/resources/trips` folder.
        We provide you with the snippet, as it is tedious work to convert this, and we wanted to give you time to focus on more pleasant things.

1. Declare a private field of type `Trips` in the `TripCalculatorTest` class.
1. Initialize the trips variable with a mock instance of the `Trips` class using `Mockito` in the `setUp` method of the `TripCalculatorTest` class.

    ??? example "Need help?"
        ```java
        private SomeClass someClass;

        @BeforeEach
        void setUp() {
          someClass = mock(SomeClass.class);
        } 
        ```

1. Use this mock instance of `Trips` when creating the `TripCalculator` instance as constructor argument.
1. In the tests, use `Mockito`'s `when(...).thenReturn(...)` methods, to return the fixture matching the file under test as return value for `readFromCsv`.

    ??? example "Need help?"
        ```java
        final String filename = "2025-01.csv";
        when(trips.readFromCsv(filename)).thenReturn(Fixtures.data202501);
        double result = testee.calculate(filename);
        ```

1. Add `throws IOException` to the test cases method signatures, because `readFromCsv` declares `throws IOException` in its method signature.

1. Run the tests. They should all pass.

!!! info "Mocking the database"
    In theory, we could also mock the database access in a similar fashion. However, we will skip this for the sake of brevity.

### 4 - Refactor

Once the tests are in place, it is usually time to refactor. There are A LOT of improvements you could make to the code.

Since there is already a dedicated [Refactoring](../refactoring/java.md) module, we won't provide a step-by-step guide. You are free to **make any changes you deem necessary**, provided you **do not alter** the **test data**, **test outcomes**, **database file**, or the **`TripCalculator` API**.

If you run out of ideas, take a look at the [Stretch Goals](#stretch-goals).

We strongly encourage you to refactor the code to make it more readable, as you will need to add a new feature in the next step.

!!! warning "Timebox Your Refactoring Efforts!"
    While refactoring is important, it is not the primary focus of this exercise.  
    You should apply some level of refactoring to clean up the code, but be sure you do not spend too much time on it.

### 5 - Add New Feature

In the final part of this exercise, we want to add the new feature that made it necessary to touch the legacy code in the first place.

- The CSV files have a `Destination` column containing a country code (e.g. HU, DE, IN).
- We want to be able to provide one or more country codes to our calculate method.
- If a trip's destination in the file matches any of the given country codes, apply a fixed discount of `50`, but only once per file.

    !!! example "Example"
        ```java
        calculator.calculate(CSV_FILE_NAME, "NL", "DE");
        ```

- This kind of discount will be applied **after** all other discount *rates* have been applied.

!!!info "Test-Driven Development"
    We are done adding tests for the existing code, so we will change gears and **return to the "TDD" approach** we use in other exercises.


#### 5.1 Test First

Let's add a test for the new feature first.

1. Add a test case to the `TripCalculatorTest` test class that tests the following: `an absolute discount amount of 50 should be applied if a trip in the file has one of the provided country codes`.
    1. Use the API mentioned above, and choose any one country code from `test_achim_short_term_few_trips.csv`.
        
        We chose this specific file because no other discount rules are applied to it. We hope you understand why based on the code, if not, you'll have to trust us 😉.
    
    1. Assert that the returned value is `50` less than the value returned for `test_achim_short_term_few_trips.csv`.

    ??? example "Need help?"
        ```java
        when(trips.readFromCsv(FILENAME)).thenReturn(Fixtures.FILENAME_MATCHING_DATA);
        double result = testee.calculate(FILENAME, "CH");
        assertThat(result).isEqualTo(RESULT_SHORT_TERM_FEW_TRIPS - 50);
        ```

1. Run the test. It should fail. In fact, you should see a compilation error.


#### 5.2 Implement Feature

1. Add a `String...` parameter called `countryCodes` to the `calculate` method as a second argument.

    ??? info "What does `String...` mean?"
        - `String...` is a so called `varargs` or variable arguments parameter.
        - It can accept any number of arguments of the denoted type, you can even omit the parameter all together.
        - Such parameters are treated and behave as arrays, which means when calling a method using a `varargs` parameter you can
            - supply individual values like `calculate("CH", "DE")`
            - or a string array value like `calculate(new String[] {"CH", "DE"})`.
        - When interacting with the parameter within the method, array access is used as well.

1. Run the test. It should still fail.

1. Update the code to implement the new feature. Remember the additional discount is credited only **once per file**, if at all.

1. Run the tests. They should pass.

#### 5.3 Make sure its working correctly

1. Add another test `should apply discount only once per file even if two of the trips countries match the provided country codes`:
    1. Pass two different country codes contained in the file, e.g. `"DE", "ES"` as the second parameter.
    1. Assert that a discount of `50` was applied.

1. Run the tests, they should all still pass.

    If they fail, then adapt your implementation accordingly.

You should write many more tests for this feature, to ensure it works as expected (e.g. no country code matches, empty country code list, etc.). We trust that you can handle these without our step-by-step guidance by now 😉.

## 🙌 Congratulations! Submit your solution.

{% with path_name="java/legacy-code", language="Java", branch_name="legacy-code" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}


## 🏁 Summary

Congratulations! You have successfully added tests to a legacy code base and implemented additional functionality.

## 🦄 Stretch Goals

Ask yourself: Are you satisfied with the final structure of your code? We took care of base structure, but there are definitely more code improvements you can do.

A few examples:

1. Enhance the `Main` class so you can provide a list of country codes on invocation, i.e. `java -jar $JAR_FILE 2025-01.csv FR DE CH`. This will allow us to use the new feature in the script.
1. We split `tripsData` twice. Comparing it to the contents of the csv files, we need the `uuid` and the `price` values to perform the calculation. Create a class `TripEntry` with fields `uuid` (String) and `price` (Long).
1. Replace the hard-coded discount values with constants.
1. Can you get rid of the `splitted` variable?
1. `trips.readFromCsv(FILENAME)` and `customers.getAllById` could fail. We do not have tests for error cases in the `TripsCalculator` test suite. Add them.
1. In the test suite of `CustomerRepository` we only assert on the length of returned because we were not sure about the returned structure. Enrich the tests verifying the properties of the returned customers.
1. Move out the calculation ("business") logic into a separate class (e.g. `CalculationEngine`).


## 📚 Recommended Reading

- [Michael C. Feathers - Working Effectively with Legacy Code](https://search.worldcat.org/title/660166658){target=_blank}


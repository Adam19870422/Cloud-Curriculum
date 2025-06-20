# Decoupling & Test Isolation

<!-- TrackingCookie-->

{% with pagename="decoupling-python" %}
{% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

## 🎯 Learning Objectives

In this module you will learn...

- how to decouple your code by using the Dependency Inversion Principle (DIP) and Dependency Injection (DI)
- how to isolate your tests
- how to use Pytest Mock for basic mocking

## 🧠 Theory

> "Keeping the tests running very fast is a design challenge. It’s one of the design constraints that well heeled craftsmen put upon themselves." (source: [Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2014/09/03/TestTime.html){target=_blank})

- General concepts: [slides](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/decouplingAndTestIsolation-slides/index.html?tags=java){target=_blank} ([with speaker notes](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/decouplingAndTestIsolation-slides/index.html?tags=java&showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_of5w6xco){target=_blank}
- Isolate tests with Pytest-mock: [slides](https://pages.github.tools.sap/EngineeringCulture/ase/Python/pytest-mock-slides/index.html){target=_blank} ([with speaker notes](https://pages.github.tools.sap/EngineeringCulture/ase/Python/pytest-mock-slides/index.html?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_zjqco7w2){target=_blank}

## 💻 Exercise

In the following exercises we will tackle the dependencies of the class `MovieFinder`.
Step by step we will adjust the dependency of this class to make it more loosely coupled.
By isolating the unit tests from external dependencies, we will be able to test the core functionality of `MovieFinder` in isolation.

<!-- Prerequisites-->

{% with
  required=[
      '[Pytest-mock](https://pytest-mock.readthedocs.io/en/latest/){target=_blank}'
  ]
%}
{% include 'snippets/prerequisites/python.md' %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="decoupling", folder_name="decoupling-python" %}
{% include 'snippets/clone-import/python.md' %}
{% endwith %}

{% with folder_name="decoupling-python" %}
{% include 'snippets/python-create-use-virtual-env.md' %}
{% endwith %}

{% include 'snippets/install-dependencies/python.md' %}

{% include 'snippets/run-tests/run-tests-aggregate-python.md' %}


    **You should see the tests failing with some error like:**

    ```
    sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) connection to server at "localhost" (::1), port 5432 failed: Connection refused
    ```

    This error is expected. The reason for it is that we have some nasty dependency that makes testing harder.

### 🔍 Code Introduction

The main entity of the code is the `Movie` class.
It consists of the fields `title`, `director` and `id`.

The movie entities can be persisted to a database using the class `PostgresMovieStorage`.
It provides methods to save, retrieve and delete movies.

Finally we have the `MovieFinder` class, which is responsible for retrieving Movies from the storage, filtered by title or director.
The exercise will focus on the `MovieFinder` class and the corresponding tests.

### 1 - Implement Dependency Inversion Principle (DIP)

The **Dependency Inversion Principle** states that:

> 1. High-level modules should not depend on low-level modules.
     Both should depend on the abstraction.
> 1. Abstractions should not depend on details.
     Details should depend on the abstraction. (source: [Wikipedia](https://en.wikipedia.org/wiki/Dependency_inversion_principle){target=_blank})

Let's understand this principle in the context of our code:

- The `MovieFinder` class uses the concrete `PostgresMovieStorage` class, therefore it is tightly coupled.
- In our scenario, the `MovieFinder` class is the high-level module, since it's depending on another module (`PostgresMovieStorage`).
- According to DIP we should make it depend on an abstraction.

**What's the problem here?**

The tightly coupled `PostgresMovieStorage` makes our `MovieFinder` hard to test. The database needs to be present and configured correctly. Furthermore, it makes test execution slower and adds an additional source of error.

You could get the tests running by starting a db locally using Docker - _however this is not required here_!

```sh
docker run --rm -e POSTGRES_HOST_AUTH_METHOD=trust -p 5432:5432 postgres:alpine
```

Since we only want to test the own logic of the `MovieFinder`, a true unit test, that is decoupled from the data base, will be better. So instead of running the tests with a real DB, let's better fix the coupling issue!

#### 1.1 Inverse the Dependency

The current test code takes advantage of the database being physically a "singleton" - although the test uses a separate storage instance than the movie finder, the movies that the test created & saved, will end up in the same database and are therefore accessible by the movie finder.
    
If for some reason, the different storage instances could be configured (e.g. to point to a different database host, or access with a different user that has different privileges), suddenly the tests would start to fail. And frankly, it looks nasty as hell.

This is called "spaghetti coding" - you see one end of the spaghetti, but can only guess where the other end is. This also creates temporal coupling - if things are not happening in the right execution order, it will lead to unexpected behavior. Let's improve that.

1. In the `MovieFinder` class, add an argument `movie_storage` to the constructor. To keep things compatible / non-breaking, you can default it with the `PostgresMovieStorage`, in case it is not provided.

    ??? example "Need help?"

        ```python
            def __init__(self, other_component):
                self.__other_component = other_component or OtherComponent()
        ```


2. In the `test_movie_finder` file inside the `movie_finder` fixture, use this constructor to pass the instance of `PostgresMovieStorage`.

    ??? example "Need help?"

        ```python
            @pytest.fixture
            def test_object():
                other_component = OtherComponent()
                ... # configure the other component if needed
                return TestObject(other_component)
        ```

Now we have created a way of passing in a different implementation of the movie storage, that is easier to control. Let's take advantage of it.

#### 1.2 Inject a Stub

In our tests, we want to verify correct logic of our movie finder. The dependency to the storage that persists in the database, hurts us. So let's fix this.

We'd like an implementation of `MovieStorage` that could just provide us with the values that we need in order to test the core functionality of `MovieFinder` independently.

Since our previous step made the `MovieFinder` depend on an abstraction (`MovieStorage`) that can be injected, we will take advantage of it.

1. Go to `tests` folder and create a class `MovieStorageStub` in a file named `movie_storage_stub.py`.

2. Provide a mechanism for this storage stub to receive some movies, e.g. in the constructor.

3. Check which methods of the storage are required by the `MovieFinder` and implement accordingly.

4. Supply this storage stub from your test instead of the `PostgresMovieStorage`

    ??? example "Need help?"

        ```python
            @pytest.fixture
            def test_object():
                other_component_stub = OtherComponentStub(...)
                return TestObject(other_component)
        ```

5. Run the tests to make sure they are passing

#### 1.3 Inline Stub

You may also try to define a stub inline, i.e. in your test file. If your stub is nice and concise, that can sometimes even make the test more easy to understand, as "cause and effect" are then a bit closer.

### 2 - Use Pytest-mock

We used the `MovieStorageStub` to provide canned answers to the calls towards the `MovieStorage`.
Using Pytest-mock we won't have to write [test doubles](https://martinfowler.com/bliki/TestDouble.html){target=_blank} manually.
Within our test class we can create test doubles with Pytest-mock and instruct them to behave as we wish.

1. In the `test_movie_finder` use the `Mock` class to directly create a mock based on the `PostgresMovieStorage`.

    ??? example "Need help?"

        ```python
            nasty_thing_mock = Mock(NastyThing)
        ```

2. Advise the mock to return the desired response when its method is called

    ??? example "Need help?"

        ```python
            nasty_thing_mock.some_method.return_value = ...
        ```

### 3 - Using Abstract Classes

Although Python is a script language that doesn't require interfaces, sometimes having explicit classes that describe an interface, can help understanding the code better, and can also be leveraged by tools such as mock frameworks, static check tools, or code generation features from the IDE, to make your life easier.

!!! info "Should I use abstract classes or not?"
    As described above, you can gain certain benefits from abstract classes. On the flip side, it is additional code that also needs to be maintained and kept consistent.
    There is no general guidance whether this should or should always be done - in this step you will try it out, so that you know how it works, and develop a feeling for the pros and cons. This can help you making better decisions in the future.

#### 3.1 Create Abstract Base Class

The `PostgresMovieStorage` class provides methods to save, retrieve and delete a movie. Whether these get stored in a postgres database, or a different kind of database, or even as a json file on the file system, is an implementation detail.

Hence we could let other storage classes implement these operations to feature a new storage type, e.g. persisting data to a different data base.

Let's create a parent class `MovieStorage`:

1. In the class signature of `PostgresMovieStorage` use the inheritance as such `class PostgresMovieStorage(MovieStorage):`.
2. Create the missing class as `MovieStorage`.

!!! info "Abstract classes"
    By default, Python does not provide abstract classes. Python comes with a module that provides the base for defining Abstract Base classes(ABC) and that module name is `ABC`.

#### 3.2 Pull Abstract Methods Up

The methods inside `PostgresMovieStorage` should be declared in the interface, but implemented in the concrete class.

Therefore, pull the method declarations up to the `MovieStorage` and override them in the `PostgresMovieStorage` class.

You can use the "Pull (Members) Up" refactoring if you are using PyCharm as an IDE:

=== "Pycharm"
{% filter indent(4) %}
- Select the methods to be pulled up.
- From the main or context menu, choose **Refactor | Pull Members Up**. The Pull Members Up dialog appears.
- Select the destination object (superclass).
- In the Members section, select the members you want to move.
- To move a method as abstract, select the checkbox in the column Make abstract next to the method.
- Click Refactor to pull the selected members to their destination.
{% endfilter %}

It is not possible yet to do this in Visual Studio Code when coding in Python, you have to create them manually.

??? example "Need help?"

    ```python
    from abc import ABC, abstractmethod

    class Animal(ABC):

        @abstractmethod
        def move(self):
            pass
    ```

#### 3.3 Stub for `MovieStorage`

Let's re-do the stub that we manually created in the previous step, but this time we use the abstract base class (`MovieStorage`) to guide the implementation. The abstract base class makes sure that we implement all the methods that are required, so we cannot run into trouble such as typos that easily.

1. Go to `tests` folder and open the file named `movie_storage_stub.py` that you created before.

2. Write the new class as an implementation of `MovieStorage` and implement the methods that should be overridden.

    !!! info "PyCharm to automatically generate overridden methods"
        If a class is declared as implementing a certain abstract class, it has to implement the methods of such class. PyCharm creates stubs for implemented methods - It's possible to implement methods decorated with `@abstractmethod` and methods that contain `raise NotImplementedError`.

3. Use that abstraction in your tests and make sure the tests are passing

4. Now try the same using the mock framework, and compare the advantages and drawbacks of either approach. When would you use the one, and when the other approach? What can this tell you about your code?

## 🙌 Congratulations! Submit your solution.

{% with path_name="python/decoupling", language="Python", branch_name="decoupling" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}

## 🏁 Summary

Congratulations!
You have successfully decoupled a class and its dependency.
Now you're able to use different implementations more flexibly.
Also it is easier to test the functionality of `MovieFinder` since we can isolate it easily from its dependencies.

## 📚 Recommended Reading

- [Martin Fowler - Reducing Coupling](https://martinfowler.com/ieeeSoftware/coupling.pdf){target=_blank}
- [Inversion of Control (IoC) example](https://www.tutorialsteacher.com/ioc){target=_blank}

## 🔗 Related Topics

- [Martin Fowler - Test Doubles](https://martinfowler.com/bliki/TestDouble.html){target=_blank}

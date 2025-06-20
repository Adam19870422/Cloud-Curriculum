# Persistence

<!-- TrackingCookie-->
{% with pagename="persistence-python" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

## 🎯 Learning Objectives

In this module you will learn

- how to connect your application with a database.
- how to interact with a database using [SQLAlchemy](https://www.sqlalchemy.org/){target=_blank}.
- how to migrate database using [Alembic](https://alembic.sqlalchemy.org/en/latest/){target=_blank}.
- how to write test cases using a database container.

## 🧠 Theory

>In computer science, persistence refers to the characteristic of state that outlives the process that created it. (source: [Wikipedia](https://en.wikipedia.org/wiki/Persistence_(computer_science)){target=_blank})

  - General Concepts: [slides](../slides/fundamentals){target=_blank} ([with speaker notes](../slides/fundamentals/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_ber4k7uz){target=_blank}
  - Python specific: [slides](../slides/python){target=_blank} ([with speaker notes](../slides/python/?showNotes=true){target=_blank})


## 💻 Exercise
In this exercise you will setup a database for a book-service.

<!-- Prerequisites-->
{% with
  tools=[
    ('[**Docker**](../../prerequisites/python/#docker){target=_blank}'),
  ],
  required=[
    ('Basic understanding of [relational Databases](https://www.oracle.com/database/what-is-a-relational-database/){target=_blank}'),
    ('Basic understanding of [docker](https://app.pluralsight.com/sso/sap?returnUrl=library/courses/docker-building-running-first-app/table-of-contents){target=_blank}')
  ],
  beneficial=[
    ('[Pytest](https://docs.pytest.org/en/latest/contents.html){target=_blank}')
  ]
%}
{% include 'snippets/prerequisites/python.md' %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="persistence-python", folder_name="persistence-python" %}
{% include 'snippets/clone-import/python.md' %}
{% endwith %}

{% with folder_name="persistence-python" %}
{% include 'snippets/python-create-use-virtual-env.md' %}
{% endwith %}

{% include 'snippets/install-dependencies/python.md' %}

### 🔍 Code Introduction

Let's have a look at the provided source code:

- `src/book_service.py` defines a class that has some methods which throw a `NotImplementedError`.
  Over the course of the exercises, you will implement these methods to communicate with the database.
- `tests/test_book_service.py` is a test file for the `book_service` which represents the database interface. Currently, there is one failing test. We will change that!

Any files not listed are not important for now and will be explained later in the exercise.

### 0 - Run Tests

The exercises follow a "test first" approach, so before you write any production code, you will write a test case which tests the intended behavior.
Take small steps and implement only what is needed to make the test pass.
Only then add another test case which defines additional behavior.

To run the tests in the command line terminal:

```
pytest
```

### 1 - Acquiring the Database Connection

Before we start retrieving and persisting data into the db, let's ensure that we have connected to the database successfully.
Therefore we will be testing if we can perform a basic query.

#### 1.1 - Install the DB-Client
To be able to connect and send queries to a postgres database we will be using the `SQLAlchemy` and `psycopg2-binary` packages.

`SQLAlchemy` is the Python SQL toolkit and Object Relational Mapper that gives application developers the full power and flexibility of SQL; while `psycopg2-binary` is the most popular PostgreSQL database adapter for the Python programming language.

1. Execute the following command to install both:
    ```shell
    pip install SQLAlchemy psycopg2-binary
    ```

1. Inside the file `test_book_service.py`, implement the method `test_should_connect_to_database()` by creating a SQLAlchemy engine and connecting to a local PostgreSQL database instance.

    ```python
    from sqlalchemy import create_engine
    engine = create_engine('postgresql://postgres@localhost:5432/postgres')
    ```

    !!! info "`Engine` on SQLAlchemy is used to manage both Pools and Dialects of database connection"

#### 1.2 - Write the First Test

Complete the first test in the file `test_book_service.py`.

1. Use the `connect()` method of the `engine` object to create an `Connect` object which can interact with database directly.

1. Import `text` from `sqlalchemy`, and use the `text()` construct to convert the following SQL string as textual SQL:

    ```SQL
    SELECT 1 as one
    ```

1. The `Connect` object can `execute` a transaction by providing the textual SQL as a parameter.

1. Assert that the result is equal to a **tuple** object:
    ```python
    (1,)
    ```

??? info "Database connection context"
    Because the `Connection` object creates an open resource against the database, we want to limit the use of this object to a specific context. The best way to do that is with a Python context manager, also known as the `with` statement. The `with` statement ensures that the connection is automatically closed when the block inside the `with` statement is exited, either normally after all commands execute successfully or through an exception. Here is an example:

    ```python
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1 as one"))
        assert result.fetchone() == (1,)
    ```

The test verifies that a database connection can be used to execute SQL queries.
It should fail (due to a missing database to connect to).

Well, we haven't set up any database yet, thus the driver is not able to connect.

#### 1.3 - Start a Test Database in Docker
We need a database which we will be using in our test runtime.

Let's start a PostgreSQL database in a container with the following command:
```shell
docker run --rm --name test-postgres -p 5432:5432 -e POSTGRES_HOST_AUTH_METHOD=trust postgres:16-alpine
```

??? info "Brief explanation of the docker command"
    1. `docker run` pulls and starts a docker container (in that case a `postgres` container - see last argument - which will be pulled from the public docker repository)
    1. `--rm` will remove the container completely once it is stopped.
    1. `--name test-postgres` names the postgres container (use e.g. `docker ps`)
    1. `-p 5432:5432` maps the port 5432 on localhost (your machine) to the exposed port 5432 in the docker container. That way you can connect to your database via `localhost:5432`
    1. `-e POSTGRES_HOST_AUTH_METHOD=trust` injects the environment variable `POSTGRES_HOST_AUTH_METHOD`, configuring PostgresSQL to trust all incoming connections

Now rerun your test. It should be passing ✔.

#### 1.4 - Close the Database Connection 🚪

The `engine.dispose()` method is used to close all connections managed by the engine's connection pool and release the resources. In testing scenarios, where you create and tear down the database connection repeatedly, using `engine.dispose()` ensures that each test starts with a fresh connection pool, avoiding potential issues from reused connections.

You should close the database connection once all tests have finished.

1. Create a `@pytest.fixture` hook where you prepare the database `engine` before tests and dispose it after tests.

1. Use the test fixture in you test method.

    ??? example "Need help?"
        In pytest, [fixtures](https://docs.pytest.org/en/6.2.x/fixture.html){target=_blank} are functions you define that serve the purpose of preparing test context and cleaning up before and after each test, such as database setup/tear-down.
        ```python
        @pytest.fixture
        def database_setup():
            engine = create_engine('...')
            yield engine
            engine.dispose()

        def test_should_connect_to_database(database_setup):
            engine = database_setup
            ...
        ```

### 2 - Simple Queries

The `BookService` class specifies the database interface for adding and retrieving books.
However, in its current state it only throws errors.
Time to change that!

#### 2.1 - Test the BookService ❌

1. Open the file `test_book_service.py` 
1. `import` the `BookService` from `src.book_service`
1. `import` the `Book` from `src.book`
1. add a test called "test_should_retrieve_all_books" that:
    1. receive the `engine` object from the test fixture as its parameter
    1. instantiates the `BookService` and passes the `engine` object to its constructor.
    1. retrieves all books from it
    1. asserts that the returned array is empty (since no books have been added).

When you are done the test should fail, because the constructor does not expect any arguments.

#### 2.2 - Implement the BookService

The `BookService` shall send queries to the database through the `connect` object which provides the `execute` method.
The query result is an array which contains all the entries found.

1. Add the `engine` as dependency to `BookService`'s constructor function, and use it to execute the following query in its `get_all_books` method:
    ```SQL
    SELECT * FROM books
    ```

1. Make the `get_all_books` method return the all the rows from the query.

1. Make sure to pass the `engine` object to the `BookService` constructor in the test.

1. Run the test. It should fail with the following error:
`relation "books" does not exist`

#### 2.3 - Create the Schema

The table "books" was never created, so the query fails naturally.
The file `schema.py` provides SQL-queries for creating and dropping the required table. 

In the `test_book_service.py` file:

1. `import` the query `CREATE_TABLE_SQL` from `src.schema`
1. Execute the `CREATE_TABLE_SQL` after the `engine` instantiation in the test fixture.

??? info "Do not forget to commit"
    The default behavior of the Python DBAPI is that a transaction is always in progress; when the connection is released, a ROLLBACK is emitted to end the transaction. The transaction is not committed automatically.

    If you want commit some changes to the database, for example, create a table, insert some data, you should commit the transaction using the `Connection.commit()` method. SQLAlchemy refers to this style as **commit as you go**.

    Another style to commit data is known as **begin once**. You use the `Engine.begin()` method to get the connection, rather than the `Engine.connect()` method. This method will manage the scope of the Connection and will commit itself when the context block ends normally and emit a rollback if an exception is raised. For example:

    ```python
    with engine.begin() as conn:
        result = conn.execute(text("SQL query"))
    ```

The test should now be passing.

Executing a query on every app start is not the best way to go about. We will take care of this later.

### 3 - Query Parameters

The previous test ensures that the book retrieval is working, but that is not very exciting, when there is no way to add any books.

#### 3.1 - A new Test ❌

1. Go to the `test_book_service.py` and create a new test case "test_should_add_a_book".
1. Extract the creation of the `BookService` instance into another test fixture to avoid duplication. And pass the instance to the test method.
1. To test the functionality of adding a book, call the `add_book`-method of the `BookService` and give it an Book object like:
    ```python
    Book("Refactoring", "Martin Fowler")
    ```

1. Use the previously implemented `get_all_books`-method to retrieve all books.
1. Assert that the retrieved array has exactly one entry with the expected title and author.

The test should be failing with the message `Not implemented yet`.

#### 3.2 - Make the Test Pass ✔️

Go to `book_service.py` and implement the `add_book`-method.

1. Query the database by using the `query`-method on the `pool` object with the following SQL:
    ```SQL
    INSERT INTO books (title, author) VALUES (:title, :author)
    ```

1. Supply a dictionary containing the values to replace the place-holders `:title` and `:author` as a second parameter to the `connect` function.
    Use the properties of the `books` object appropriately.

    ??? example "Need help?"
        ```python
        conn.execute(text("INSERT INTO ARTIST (name, surname) VALUES (:name, :surname)"), {"name": "John", "surname": "Lennon"})
        ```

Your test should be passing now.
If not, you possibly ran the test multiple times and end up with the test failing due to:
```
error: duplicate key value violates unique constraint "title_author_uniqueness"
```

In this case the next exercise step should help you fixing this problem.

#### 3.3 - Clean up the Schema 🧹

One of the tests changes the state of the database while both tests assume a certain state at the beginning. This indicates the current tests are very fragile and quite possibly not isolated enough.

In order to make the tests more stable, ensure that the database is cleaned up after each test.

In the `test_book_service.py` file:

1. `import` the `DROP_TABLE_SQL` and `TRUNCATE_TABLE` queries alongside the already imported `CREATE_TABLE_SQL`.
1. Modify the test fixture before each test wherein you execute the `TRUNCATE_TABLE` query provided by `schema`.  
1. Execute the `DROP_TABLE_SQL` query before the `engine.dispose()` call after each test in order to drop the books table entirely once all tests have been run . 

The tests should then be passing regardless of their order.

### 4 - Exception Handling

Let's add some exception handling to our communication with the database.
For this matter we will be using the unique constraint on the `books` table.

#### 4.1 - Add Test to Ensure Uniqueness

The `books` table has a unique constraint on the columns `title` and `author`.
Let's ensure that a proper error is thrown when the constraint is violated.

1. Add a new test to `book-service-test.ts` with the name "test_should_raise_exception_when_add_duplicated_book".

1. `import` the UniqueConstraintViolationError from `src.unique_constraint_violation_error`

1. Inside the test call the `add_book`-method of the BookService twice with the same book parameter in order to provoke the constraint violation.

1. Use the `pytest.raises()` method to make sure the second call to the database throws an error. This methods accepts an error class as arguments.

    ??? example "Need help?"
        ```python
        with pytest.raises(AnErrorClass):
            a_method_throws_an_error()
        ```

The test should be failing.

#### 4.2 - Make the Test Pass ✔️

To make the test pass, first we need to check if the error thrown by SQLAlchemy is because of the unique constraint violation.
And then throw a custom error `UniqueConstraintViolationError` in order to make the error case more distinguishable.

1. Go to the `book_service.py` and wrap the call of database transaction into a try-except.

1. `import` the UniqueConstraintViolationError from `'../unique-constraint-violation-error'` like in the test class

1. Inside the except block, check if the `error` if of type IntegrityError, and its `pgcode` property is equal to the class variable `UNIQUE_VIOLATION_ERROR_CODE` which has the preset value `23505`. 

    ??? info "PostgreSQL Error Codes"
        PostgreSQL maps different types of errors to error codes.

        You can check out the reference of [PostgreSQL Error Codes](https://www.postgresql.org/docs/10/errcodes-appendix.html){target=_blank} to see the list of error codes that can occur.

1. If the condition matches, throw a new `UniqueConstraintViolationError`, otherwise just throw the `error` that was caught before.

    ??? example "Need help?"
        ```python
        from sqlalchemy.exc import IntegrityError

        ...
        try:
            a_method_throws_an_error()
        except Exception as e:
            if type(e) is IntegrityError and e.orig.pgcode == self.UNIQUE_VIOLATION_ERROR_CODE:
                raise UniqueConstraintViolationError()
            else:
                raise e
        ```

1. Your tests should be all passing now.

### 5 - Migration tools

As of now we create and drop the entire table before and after each test run. This is totally fine for testing purposes, but devastating in a production environment. If we would do this during startup/teardown of the app we would lose all our data!
Luckily, there are `migration` tools that help to manage the database state and only apply the latest changes in the order they were created.

Here you will be using [Alembic](https://alembic.sqlalchemy.org/en/latest/){target=_blank} - a lightweight database migration tool for usage with the SQLAlchemy Database Toolkit for Python.

1. Install the required packages:
    ```shell
    pip install alembic
    ```

1. Run the following command to initiate the migration script:

    ```shell
    alembic init migrations
    ```

    The init command creates a folder named `migrations` in your project's root path, and a configuration file named `alembic.ini`.

1. Open the `alembic.ini` file and change the `sqlalchemy.url` property value with the connection string for your database. For example:

    ```config
    sqlalchemy.url = postgresql://postgres@localhost:5432/postgres
    ```

1. Run the following command to create migrations manually:

    ```shell
    alembic revision -m "Add a new Books table"
    ```

    Notice that there is new Python file generated in the folder `migrations/versions`. The migration file follows a certain schema (id + name)

1. Inside the migration file, you can apply the database changes through the `upgrade` method. 

    ??? example "Need help?"
        ```python
        def upgrade() -> None:
            op.execute("SQL statement")
        ```

1. Import `CREATE_TABLE_SQL` from `src.schema`, and provide it to the `execute` method as argument.

1. Run the following command to apply changes to the database:

    ```shell
    alembic upgrade head
    ```

    Now you should be seeing something similar to
    ```sh
    INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
    INFO  [alembic.runtime.migration] Will assume transactional DDL.
    INFO  [alembic.runtime.migration] Running upgrade  -> ec9b85985d3f, Add a new Books table
    ```
    
    Now, if you would like to change the database you need to generate a new migration file with the corresponding changes and `alembic` would only apply the ones that were not yet applied.

1. Delete the `CREATE_TABLE_SQL` / `DROP_TABLE_SQL` calls in the test fixture of the `tests/test_book_service.py` file.

1. Run tests and they should be all passing.

## 🙌 Congratulations! Submit your solution.

{% with path_name="python/persistence", language="Python", branch_name="persistence-python" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}


## 🏁 Summary
Good job!
In this exercise you wrote test cases with a containerized database, installed and used the `SQLAlchemy` module to connect to it and fired off your own SQL queries.

## 🦄 Stretch Goals

{% include 'snippets/stretch-goal-disclaimer.md' %}

You should already have a good idea of all common parts by now, you could stop here... oooor you can finish what you started:

- Implement the `get_book_by_title` method, so that it returns all books whose title matches exactly with the argument string.
- Make the `get_book_by_title` return all books whose title _includes_ the argument string.

## 📚 Recommended Reading
- [SQLAlchemy ORM Quick Start](https://docs.sqlalchemy.org/en/20/orm/quickstart.html){target=_blank}

## 🔗 Related Topics
- [Raw SQL vs Query Builder vs ORM](https://levelup.gitconnected.com/raw-sql-vs-query-builder-vs-orm-eee72dbdd275){target=_blank}
- [SQL vs NoSql Overview](https://www.imaginarycloud.com/blog/sql-vs-nosql/){target=_blank}(Note that some data stores are not offered at SAP and never will be. Internal guidance on this topic is being worked on by CPA)

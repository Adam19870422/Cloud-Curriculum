# Persistence

<!-- TrackingCookie-->
{% with pagename="persistence-nodejs" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

{% include 'snippets/node22-disclaimer.md' %}

## 🎯 Learning Objectives

In this module you will learn

- how to connect your application with a database.
- how to interact with a database using [node-postgres](https://node-postgres.com/){target=_blank}.
- how to write test cases using a database container.

## 🧠 Theory

>In computer science, persistence refers to the characteristic of state that outlives the process that created it. (source: [Wikipedia](https://en.wikipedia.org/wiki/Persistence_(computer_science)){target=_blank})

  - General Concepts: [slides](../slides/fundamentals){target=_blank} ([with speaker notes](../slides/fundamentals/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_ber4k7uz){target=_blank}
  - Node.js specific: [slides](../slides/nodejs/?tags=typescript){target=_blank} ([with speaker notes](../slides/nodejs/?tags=typescript&showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_i2vtx2u8){target=_blank}


## 💻 Exercise
In this exercise you will setup a database for a book-service.

<!-- Prerequisites-->
{% with
  tools=[
    ('[**Docker**](../../prerequisites/nodejs/#docker){target=_blank}'),
  ],
  required=[
    ('Basic understanding of [relational Databases](https://www.oracle.com/database/what-is-a-relational-database/){target=_blank}'),
    ('Basic understanding of [docker](https://app.pluralsight.com/sso/sap?returnUrl=library/courses/docker-building-running-first-app/table-of-contents){target=_blank}'),
    ('[JavaScript Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes){target=_blank}'),
    ('[Private class features](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields){target=_blank}')
  ],
  beneficial=[
    ('[Mocha](https://mochajs.org){target=_blank}')
  ]
%}
{% include 'snippets/prerequisites/nodejs.md' %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="persistence-ts", folder_name="persistence-nodejs" %}
{% include 'snippets/clone-import/nodejs.md' %}
{% endwith %}

{% include 'snippets/install-dependencies/nodejs.md' %}

### 🔍 Code Introduction

Let's have a look at the provided source code:

- `src/lib/books/book-service.ts` exports a class that has some methods which throw a `NotImplementedError`.
  Over the course of the exercises, you will implement these methods to communicate with the database.
- `test/books/book-service-test.ts` is a test file for the `book-service` which represents the database interface. Currently, there is one failing test. We will change that!

Any files not listed are not important for now and will be explained later in the exercise.

### 0 - Run Tests

The exercises follow a "test first" approach, so before you write any production code, you will write a test case which tests the intended behavior.
Take small steps and implement only what is needed to make the test pass.
Only then add another test case which defines additional behavior.

{% include 'snippets/run-tests/run-tests-node.md' %}

### 1 - Acquiring the Database Connection

Before we start retrieving and persisting data into the db, let's ensure that we have connected to the database successfully.
Therefore we will be testing if we can perform a basic query.

#### 1.1 - Install the DB-Client
To be able to connect and send queries to a postgres database we will be using the `node-postgres` package.
This postgres client will let us set up a connection to our database.

<a href="https://www.npmjs.com/package/pg" rel="nofollow"><img src="https://nodei.co/npm/pg.png"></a>

1. Execute the following command to install it and its respective types:
    ```shell
    npm install pg
    npm install -D @types/pg
    ```

1. Inside the file `book-service.test.ts`, import the `pg`-module.
    We are going to need the `Pool` property of the `pg`-module.
    
1. Create a new instance of `pg.Pool` and assign it to a local variable `pool` inside the `describe` scope.

    The constructor of `Pool` admits an options object that contains the connection properties.
    Use one of the following connection properties:

    ```typescript
    {
        connectionString: 'postgres://postgres:pw@localhost:5432/postgres'
    }
    ```
    ```typescript
    {
        database: 'postgres',
        user: 'postgres',
        password: 'pw',
        port: 5432
    }
    ```

#### 1.2 - Write the First Test

Complete the first test in the file `book-service.test.ts`.

1. Use the `query` method of the `pool` object with the following SQL string as argument:

    ```SQL
    SELECT 1 as one
    ```

1. `await` the result and assert that its `rows` property is equal to an **array** containing the following object:
    ```typescript
    { one: 1 }
    ```

    !!! info "Use `assert.deepEqual` when comparing arrays and objects"

The test verifies that a database connection can be used to execute SQL queries.
It should fail (due to a missing database to connect to).

Well, we haven't set up any database yet, thus the driver is not able to connect.

#### 1.3 - Start a Test Database in Docker
We need a database which we will be using in our test runtime.

Let's start a PostgreSQL database in a container with the following command:
```shell
docker run --rm --name test-postgres -p 5432:5432 -e POSTGRES_PASSWORD=pw -d postgres:16-alpine
```

or via running the npm command
```shell
npm run db:start
```

??? info "Brief explanation of the docker command"
    1. `docker run` pulls and starts a docker container (in that case a `postgres` container - see last argument - which will be pulled from the public docker repository)
    1. `--rm` will remove the container completely once it is stopped.
    1. `--name test-postgres` names the postgres container (use e.g. `docker ps`)
    1. `-p 5432:5432` maps the port 5432 on localhost (your machine) to the exposed port 5432 in the docker container. That way you can connect to your database via `localhost:5432`
    1. `-e POSTGRES_PASSWORD=pw` injects the environment variable `POSTGRES_PASSWORD` into the container on startup
    1. `-d` runs the container in detached mode: it does not block the terminal thread.

Now rerun your test. It should be passing ✔.

#### 1.4 - Close the Database Connection 🚪

You may have noticed that even though the test has already passed the node process is still running.

This is because the `pool` is still connected to the database. It will only close the connection after a certain time of inactivity. (*The [default](https://node-postgres.com/apis/pool){target=_blank} `idleTimeoutMillis` is 10000 millisecons (10 seconds)*)

You should close the database connection once all tests have finished.

1. Create a `before` hook where you move the instantiation of `pg.Pool` to. Make sure the `pool` variable is available in the whole suite (describe block) and is of type `pg.Pool`.
1. Create a `after` hook wherein you close the connection by calling the async `pool.end()` method.

    ??? example "Need help?"
        ```typescript linenums="1"
        describe('BookService', () => {
          let pool: pg.Pool

          before(() => {
              pool = new pg.Pool({/* ... */})
          })

          after(async () => {
              await pool.end()
          })

          /* ...*/
        )}
        ```

The database connection and the node process should now also be closed once the tests have finished.

### 2 - Simple Queries

The `BookService` class specifies the database interface for adding and retrieving books.
However, in its current state it only throws errors.
Time to change that!

#### 2.1 - Test the BookService ❌

1. Open the file `book-service.test.ts` 
1. `import` the `BookService` from `'../../src/lib/books/book-service'`
1. add a test called "should retrieve all books" that:
    1. instantiates the `BookService` and passes the `pool` object to its constructor.
    1. retrieves all books from it
    1. asserts that the returned array is empty (since no books have been added).
        Keep in mind that the `getAllBooks`-method is an `async` function and therefore needs to be `await`ed.

When you are done the test should be unable to compile, because the constructor does not expect any arguments.

#### 2.2 - Implement the BookService

The `BookService` shall send queries to the database through the `pool` object which provides the `query`-method.
The query method returns a `Promise` which resolves with a result object.
Its `rows` property is an array which contains all the entries found.

1. Add the `pool` as dependency to `BookService`'s constructor function, assign it to a private class variable `pool`, and use it to execute the following query in its `getAllBooks` method:
    ```SQL
    SELECT * FROM books
    ```

1. Make the `getAllBooks` method return the rows from the query.
    
    !!! info "Generics for query method"
        You can use generics to add type support. The generic specifies the expected type of the entries contained in the rows array of the query result.

        ```typescript        
        pool.query<Type>('SQL Query')
        ```

        This does not guarantee type safety at runtime though, since we don't know what will be returned from the database, so use it with caution. If you are unsure about the return type, more explicit type checks are recommended and we will cover it later on.

1. Make sure to pass the `pool` object to the `BookService` constructor in the test.

1. Run the test. It should fail with the following error:
`relation "books" does not exist`

#### 2.3 - Create the Schema

The table "books" was never created, so the query fails naturally.
The file `schema.ts` provides SQL-queries for creating and dropping the required table. 

In the `book-service.test.ts` file:

1. `import` the query `CREATE_TABLE_SQL` via object destructuring from `'../../src/lib/schema'`
1. Execute the `CREATE_TABLE_SQL` after the `Pool` instantiation.
    Keep in mind, that the `query` method returns a `Promise` which needs to be `await`ed as the tests should only run, after the schema has been created. Make sure the callback in the `before` hook is an `async` function. 

The test should now be passing.

Executing a query on every app start is not the best way to go about. We will take care of this later.

### 3 - Query Parameters

The previous test ensures that the book retrieval is working, but that is not very exciting, when there is no way to add any books.

#### 3.1 - A new Test ❌

1. Go to the `book-service.test.ts` and create a new test case "should add book".
1. Extract the creation of the `BookService` instance into the `before`-hook to avoid duplication.

    ??? example "Need help?"
        Make sure that the `BookService` instance is accessible in the test by placing the variable declaration as in the following example:
        ```typescript
        let service: ThingService

        before(async () => {
            //...
            service = new ThingService(pool)
        })
        ```

1. To test the functionality of adding a book, call the `addBook`-method of the `BookService` and give it an object like:
    ```typescript
    { title: 'Refactoring', author: 'Martin Fowler' }
    ```

    !!! info "Remember to `await` the `#!javascript async` functions"

1. Use the previously implemented `getAllBooks`-method to retrieve all books.
1. Assert that the retrieved array has exactly one entry with the expected title and author.

The test should be failing with the message `Not implemented yet`.

#### 3.2 - Make the Test Pass ✔️

Go to `book-service.ts` and implement the `addBook`-method.

1. Query the database by using the `query`-method on the `pool` object with the following SQL:
    ```SQL
    INSERT INTO BOOKS (title, author) VALUES ($1, $2)
    ```

1. Supply an array containing the values to replace the place-holders `$1` and `$2` as a second parameter to the `query` function.
    Use the properties of the `books` object appropriately.

    ??? example "Need help?"
        ```typescript
        await this.pool.query('INSERT INTO ARTIST (name, surname) VALUES ($1, $2)', ['John', 'Lennon'])
        ```

Your test should be passing now.
If not, you possibly ran the test multiple times and end up with the test failing due to:
```
error: duplicate key value violates unique constraint "title_author_uniqueness"
```

In this case the next exercise step should help you fixing this problem.

#### 3.3 - Clean up the Schema 🧹

One of the tests changes the state of the database while both tests assume a certain state at the beginning.
The `Mocha` test runner executes the tests in the same order consistently, but other test runners might not.
If a test breaks, simply due to having been moved it is very fragile and quite possibly not isolated enough.

In order to make the tests more stable, ensure that the database is cleaned up after each test.

In the `book-service.test.ts` file:

1. `import` the `DROP_TABLE_SQL` and `TRUNCATE_TABLE` queries alongside the already imported `CREATE_TABLE_SQL`.
1. Create a `beforeEach` hook wherein you execute the async `TRUNCATE_TABLE` query provided by `schema`.
1. Execute the `DROP_TABLE_SQL` query before the `pool.end()` call in the `after` hook in order to drop the books table entirely once all tests have been run . 

The tests should then be passing regardless of their order.

#### 3.4 - Type Checking
As mentioned above, the generics for query method can not guarantee type safety at runtime, so we introduce [`Zod`](https://zod.dev){target=_blank} to define schemas and validate data.

1. Execute the following command to install it:
    ```shell
    npm install zod
    ```
1. Go to the `book.ts`, add the following at the very start of the file to import the zod module.
    ```typescript
    import { z } from 'zod'
    ```
1. Use `z.object()` to define two object schemas `BookPayload` and `Book`, and then export the schema `Book`, we will use it later on.

    ??? example "Need help?"
        ```typescript
        const UserPayload = z.object({
          username: z.string()
        })

        const User = UserPayload.extend({
          id: z.string()
        })
        ```

1. With `Zod`'s schema, it can extract the Typescript types with `z.infer<typeof mySchema>` for `BookPayload` and `Book`.

    ??? example "Need help?"
        ```typescript
        type User = z.infer<typeof User> // { id: string, username: string }
        ```

1. Go to the `getAllBooks` of `book-service.ts`, import the Zod object schema `Book` and use it to parse each item in the rows array and then return them. Then we can remove the return type of `getAllBooks` as it can be inferred.
```typescript
import { Book, type BookPayload } from './book'

async getAllBooks() {
  const { rows } = await this.pool.query('SELECT * FROM books')
  return rows.map((book) => Book.parse(book))
}
```

    ??? info "Schema method `.parse`"
        - Given any Zod schema, you can call its [`.parse`](https://zod.dev/?id=parse){target=_blank} method to validate data. If the data passes validation, a value is returned with full type information! Otherwise, an error is thrown.
        ```typescript
        const stringSchema = z.string()
        stringSchema.parse("fish") // => returns "fish"
        stringSchema.parse(12) // throws error
        ```

    !!! tip "Performance Cost"
        The validation process takes up a portion of the total execution time. [Benchmarks](https://moltar.github.io/typescript-runtime-type-benchmarks/){target=_blank} tests indicate that `Zod` takes 3ms to validate ~1500 rows. This should be taken into account when incorporating it into your project.



1. Run the test, it fails with the following error on path `id` when executing `Book.parse(book)`:
```
Expected string, received number
```
This is caused by the `id` of schema `Book` is a string, but the data retrieved from the database is in number format, we can utilize `Zod`'s type coercion to fix it.

1. Go to the `book.ts`, apply type coercion to `id`.
```typescript
id: z.coerce.string()
```
    
    ??? info "[Coercion](https://zod.dev/?id=coercion-for-primitives){target=_blank} for primitives"
        ```typescript
        z.coerce.string().parse(12) // => returns "12"
        ```

1. Run the test, it should be passing.

### 4 - Exception Handling

Let's add some exception handling to our communication with the database.
For this matter we will be using the unique constraint on the `books` table.

#### 4.1 - Add Test to Ensure Uniqueness

The `books` table has a unique constraint on the columns `title` and `author`.
Let's ensure that a proper error is thrown when the constraint is violated.

1. Add a new test to `book-service-test.ts` with the name "should throw an error when unique constraint is violated".

1. `import` the UniqueConstraintViolationError from `'../../src/lib/unique-constraint-violation-error'`

1. Inside the test call the `addBook`-method of the bookService twice with the same book parameter in order to provoke the constraint violation.

1. Use the async `assert.rejects()` method to make sure the second call to the database throws an async error. This methods accepts an async (expected to fail) function and the error class as arguments. Here, this should be the second call to `bookService.addBook()` and the `new UniqueConstraintViolationError()` class. Make sure to use an instance of the actual class and not a `string` as second argument, and don't forget to include the `await` keyword.

    ??? example "Need help?"
        ```typescript
        await assert.rejects(anAsyncFunctionThatShouldRejectWithAnError(), new SomeErrorClass())
        ```

The test should be failing.

#### 4.2 - Make the Test Pass ✔️

To make the test pass, first we need to check if the error thrown by `pg` is because of the unique constraint violation.
And then throw a custom error `UniqueConstraintViolationError` in order to make the error case more distinguishable.

1. Go to the `book-service.ts` and wrap the call of `pool.query` into a try-catch.

1. `import` the UniqueConstraintViolationError from `'../unique-constraint-violation-error'` like in the test class

1. Inside the catch block, check if the `error`'s `code` property is equal to the static class constant `BookService.UNIQUE_VIOLATION_ERROR_CODE` which has the `pg`-provided value `23505`. 

1. Since the caught `error` is of type `any` we need to cast its type to  `pg.DatabaseError` in order to access the code property.

1. If the error codes match, throw a new `UniqueConstraintViolationError`, otherwise just throw the `error` that was caught before.

    ??? info "PostgreSQL Error Codes"
        PostgreSQL maps different types of errors to error codes.

        You can check out the reference of [PostgreSQL Error Codes](https://www.postgresql.org/docs/10/errcodes-appendix.html){target=_blank} to see the list of error codes that can occur.

1. Your tests should be all passing now. Verify the `NotImplementedError` is not used anywhere and remove the file `src/lib/not-implemented-error.ts`.

### 5 - Migration tools

As of now we create and drop the entire table before and after each test run. This is totally fine for testing purposes, but devastating in a production environment. If we would do this during startup/teardown of the app we would lose all our data!
Luckily, there are `migration` tools that help to manage the database state and only apply the latest changes in the order they were created.


1. Install the required node modules:
    ```shell
    npm install db-migrate db-migrate-pg
    ```

    ??? info "Alternative tools"
        Many query builders or ORMs designed for Node.js also provide migration functionality like [Prisma](https://www.prisma.io/), [Sequelize](https://sequelize.org/master){target=_blank}, or [Knex.js](http://knexjs.org/){target=_blank}.

1. Create a folder named `migrations` in your project's root path. We will use `db-migrate`[programmatically](https://db-migrate.readthedocs.io/en/latest/API/programable/){target=_blank} in order to have one single source of truth for the database connection), i.e. we need to create a script that runs all migration files.
Therefore, create a file called `migrate.ts` in the `src/lib` folder with the following content (**Make sure to include the comments, otherwise Typescript will complain**):
```javascript
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import dbmigrate from 'db-migrate'

const migrate = () => {
  return dbmigrate.getInstance(true, {
    env: 'default',
    config: {
      default: {
        driver: 'pg',
        connectionString: 'postgres://postgres:pw@localhost:5432/postgres'
      }
    }
  })
}

(async () => {
  await migrate().run()
})()
```

    ??? info "Code Walkthrough"
        - We ignore the typescript errors that the import statement would cause, since db-migrate doesn't offer Typescript support.
        - We define a function called `migrate` and execute it with `await` immediately, then calling `.run()` to use the CLI mode. Since top level `await` is not supported in CommonJS module, we wrap the code inside of an Immediately Invoked Function Expression (IIFE) defined as an `async` function.
        - The imported `db-migrate` module is set up with a basic config (e.g. the connection string, in a real world setup, you would read the config from a file in order to avoid redundancy and errors)

1. The actual migration files follow a certain schema (timestamp + name). You could create such a file manually or via a `package.json` script. Add a script to the script section in the project's root `package.json` to delegate the script creation.

    ??? example "Need help?"
        ```json
        "scripts": {
          // ...
          "db:migrate": "ts-node src/lib/migrate.ts"
        },
        ```

    Finally, we have set up everything to create our first migration file. Run `npm run db:migrate create create-books` to create the file with the timestamp format like `[TIMESTAMP]-create-books.js`.


1. Inside the migration file, delete everything except of the `exports.up` function. Make that function an `async` arrow function and call `await db.runSql()` inside the function body. 

    ??? example "Need help?"
        ```javascript
        // eslint-disable-next-line no-undef
        exports.up = async (db) => {
          await db.runSql(/* SOME SQL */)
        }
        ```

1. The migration script file is a CommonJS module rather than an ESModule. Therefore, **require** the `CREATE_TABLE_SQL` statement from `src/lib/schema.ts` as argument for `await db.runSql()`.
    
    ??? example "Need help?"
        ```javascript
        // eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
        const { CREATE_TABLE_SQL } = require('../src/lib/schema')
        ```

1. Delete the `CREATE_TABLE_SQL`/`DROP_TABLE_SQL` calls in the `before`/`after` hooks of the `test/books/book-service.test.ts` files and add the following `pretest` script to run the migrations (that are not already applied) before each test. Similarly, add the `precoverage` script to run migrations before the coverage test:
    ```json
    "scripts": {
      "pretest": "ts-node src/lib/migrate.ts up",
      "test": "mocha --recursive",
      "precoverage": "ts-node src/lib/migrate.ts up",
      // ...
    },
    ```

    Now you should be seeing something similar to
    ```sh
    [INFO] Processed migration 20220824064608-create-books
    [INFO] Done
    ```

    on the first run and afterwards

    ```sh
    [INFO] No migrations to run
    [INFO] Done
    ```

    whenever you run the tests. 
    
    Now, if you would like to change the database you need to generate a new migration file with the corresponding changes and `db-migrate` would only apply the ones that were not yet applied.

1. Make sure the coverage thresholds are fulfilled (`npm run coverage`).

## 🙌 Congratulations! Submit your solution.

{% with path_name="node/persistence", language="Node.js", branch_name="persistence-ts" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}


## 🏁 Summary
Good job!
In this exercise you wrote test cases with a containerized database, installed and used the `pg` module to connect to it and fired off your own SQL queries.

## 🦄 Stretch Goals

{% include 'snippets/stretch-goal-disclaimer.md' %}

You should already have a good idea of all common parts by now, you could stop here... oooor you can finish what you started:

- Implement the `getBookByTitle` method, so that it returns all books whose title matches exactly with the argument string.
- Make the `getBookByTitle` return all books whose title _includes_ the argument string.

## 📚 Recommended Reading
- [Transactions](https://node-postgres.com/features/transactions){target=_blank}
- [Suggested Project Structure Guide](https://node-postgres.com/guides/project-structure){target=_blank}

## 🔗 Related Topics
- [Raw SQL vs Query Builder vs ORM](https://levelup.gitconnected.com/raw-sql-vs-query-builder-vs-orm-eee72dbdd275){target=_blank}
- [Sequelize ORM](https://sequelize.org/){target=_blank}
- [knexjs query-builder](http://knexjs.org/){target=_blank}
- [SQL vs NoSql Overview](https://www.imaginarycloud.com/blog/sql-vs-nosql/){target=_blank}(Note that some data stores are not offered at SAP and never will be. Internal guidance on this topic is being worked on by CPA)

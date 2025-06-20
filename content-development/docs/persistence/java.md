# Persistence

<!-- TrackingCookie-->
{% with pagename="persistence-java" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

## 🎯 Learning Objectives

In this module you will learn

- how to connect your application to a database
- how to interact with a database using Spring Data JPA
- how to write test cases using an embedded database

## 🧠 Theory

In computer science, persistence refers to the characteristic of state that outlives the process that created it. (source: [Wikipedia](https://en.wikipedia.org/wiki/Persistence_(computer_science)){target=_blank})

  - General Concepts: [slides](../slides/fundamentals){target=_blank} ([with speaker notes](../slides/fundamentals/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_ber4k7uz){target=_blank}
  - Java specific: [slides](../slides/java){target=_blank} ([with speaker notes](../slides/java/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_nzl1m5kq){target=_blank}


## 💻 Exercise
In this exercise you will set up a database for a book-service.


<!-- Prerequisites-->
{% with
  tools=[
    ('[**Docker**](../../prerequisites/java/#docker){target=_blank}'),
  ],
  required=[
    ('Basic understanding of [Relational Databases](https://www.oracle.com/database/what-is-a-relational-database/){target=_blank}'),
    ('Basic understanding of [Docker](https://app.pluralsight.com/sso/sap?returnUrl=library/courses/docker-building-running-first-app/table-of-contents){target=_blank}')
  ],
  beneficial=[
      ('[Spring](https://spring.io/){target=_blank}')
  ]
%}
{% include 'snippets/prerequisites/java.md' %}
{% endwith %}


### 🚀 Getting Started

{% with branch_name="persistence", folder_name="persistence-java" %}
{% include 'snippets/clone-import/java.md' %}
{% endwith %}

1. Run the application:

    {% with main_class="BooksApplication" %}
    {% filter indent(4) %}
    {% include 'snippets/run-application/run-java.md' %}
    {% endfilter %}
    {% endwith %}

    When the Application has started you should be able to see a line similar to the following in the console:
    ```
    [2020-08-19 09:18:45.593] - 72849 INFO [restartedMain] --- com.sap.cc.library.BooksApplication: Started BooksApplication in 1.32 seconds (JVM running for 1.925)
    ```

### 🔍 Code Introduction

We have set up a simple application for managing books.
The focus of this exercise will be to implement an API to persist the domain objects into a database.

In `src/main/java` you will find the following classes in the `com.sap.cc.library.book` package:

- `Book` - which is the main entity and has two fields (`title` and `author`).
- `Author` with the field `name`.

In `src/test/java` the class `BookFixtures` is provided.
It produces example book-objects you can use within your tests.

--8<-- "snippets/spring-dev-tools.md"

### 0 - Run Tests

The exercises follow a "test first" approach, so before you write any production code, you should write a test case which tests the intended behavior.
Take small steps and implement only what is needed to get the test to pass.
Only then add another test case which defines additional behavior.

{% include 'snippets/run-tests/run-tests-aggregate-java.md' %}

### 1 - Entities and Repositories

#### 1.1 Repositories

1. Go to the `src/test/java` directory and create a class `BookRepositoryTest` in the `com.sap.cc.library.book` package.
1. Add the following field to it:
```Java
private BookRepository repository;
```
1. Create the **interface** `BookRepository` inside the package `com.sap.cc.library.book` in `src/main/java`. (Make sure it is created in the correct location -> src/**main**/java)
2. We want it to extend one of Spring Data JPAs Repository interfaces which are not available yet. Include the following dependency to the `pom.xml` and trigger a "reload dependencies" in your IDE:
```xml
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```
1. Make the `BookRepository` extend `#!java JpaRepository<Book, Long>`.

#### 1.2 Test the Repository

1. In your `BookRepositoryTest` class, create a test method called `findAll_noBooks_returnsEmptyList` (annotated with `#!java @Test`), to test the `findAll`-method.
1. In the test, call the `findAll` method on the repository and assert that the returned list is empty (since we have not added any books yet).

    ??? example "Need help?"
        ```Java
        import org.junit.jupiter.api.Test;
        import static org.assertj.core.api.Assertions.assertThat;

        @Test
        void findAllThings_should_be_empty() {
            List<Thing> things = thingRepository.findAll();
            assertThat(things).isEmpty();
        }
        ```

1. Run the test. It should be failing due to a `NullPointerException`.

    We have not created a class that implements the `BookRepository` interface, nor have we instantiated such a class in the test. Fortunately, Spring Data JPA can handle this for us. As such, let's proceed to load the Spring context into our tests.

1. Add the `#!java @SpringBootTest` annotation to the test class and the `#!java @Autowired` annotation to its `repository` field.
1. Rerun the test and you will find it fails with the following message:
    ```shell
    Failed to configure a DataSource: 'url' attribute is not specified and no embedded datasource could be configured.
    Reason: Failed to determine a suitable driver class
    ...
    If you want an embedded database (H2, HSQL or Derby), please put it on the classpath.
    ```
1. Let's follow Spring's suggestion by adding the dependency for H2 to the `pom.xml` and trigger a "reload dependencies" in your IDE:
    ```xml
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>test</scope>
    </dependency>
    ```

1. Run your tests again, still failing

    The reasons for the test failing keep changing, now the message is: `Not a managed type: class com.sap.cc.library.book.Book`.

#### 1.3 Your First Entity 📘

1. Add the `#!java @Entity`-annotation to the `Book`-class.

    !!! tip "Prefer JPA classes/annotations over provider specifics"
        Always import classes, interfaces or annotations from the JPA specification, not the JPA provider.
        This way you keep your application and the JPA provider loosely coupled.
        For example choose `#!java @jakarta.persistence.Entity` over `#!java @org.hibernate.annotations.Entity`

    The test is still failing.
    This time for the following reason:
    `No identifier specified for entity: com.sap.cc.library.book.Book`.

1. Specify an identifier for the entity by giving it a `id` field of the type `Long`

    ??? info "Why `Long`?"
        Remember that the `BookRepository` extends the interface `#!java JpaRepository<Book, Long>`.
        The first type parameter refers to the entity while the second specifies the type of its identifier.

1. Annotate the field with `#!java @Id` and **create getter and setter** methods for it (or let your IDE do it).

1. Run the test.

    It should now be failing with the error: ``Could not determine recommended JdbcType for `com.sap.cc.library.book.Author` ``

    Hibernate (the default JPA provider of Spring Boot) tries to find an appropriate database column type for the `author` attribute and apparently fails.

1. Add the `#!java @Transient` annotation to the `author` field, to tell JPA that this field should not be persisted.

1. Run the test, it passes.

!!! warning "Spring Boot Magic and Automatic Schema Generation"
    Why does it work? We did not create any database schema or provide configuration for our H2 Database.
    Spring follows the "convention over configuration" paradigm, so if it finds a H2 DB on the classpath then it assumes we want to use it and wires it up automatically. In a similar fashion, Spring assumes that we want to let hibernate auto-create the DB schema for our entities, and asks hibernate to take care of this.

    While schema auto-creation is fine for quick iterations **early in development**, you should **never deploy an application with this setting** as this brings many issues.

#### 1.4 Database Schema

As we want to properly manage our database schema, we will use [Liquibase](https://www.liquibase.org/). It allows us to update the database schema in a reproducible manner, and keep our database changes under source control.

1. Add the liquibase dependency to our `pom.xml`:
    ```xml
    <dependency>
        <groupId>org.liquibase</groupId>
        <artifactId>liquibase-core</artifactId>
    </dependency>
    ```

1. Tell Spring where to find your changelog file by adding the following line to `src/main/resources/application.properties`
    ```properties
    spring.liquibase.change-log=classpath:/liquibase-changelog.sql
    ```
    When using Liquibase together with Spring Boot, Liquibase is able to gather all information needed to access your database from the Spring configuration.

1. Create a file called `liquibase-changelog.sql` inside your `src/main/resources` folder and add the following line to it

    ```sql
    --liquibase formatted sql
    ```

1. Run the test again to make sure that liquibase is active and trying to read from our changelog file. It should throw the error `Table "BOOK" not found; SQL statement:
select book0_.id as id1_0_, book0_.title as title2_0_ from book book0_ [42102-200]`

1. Let's fix this by adding the schema definition to the `liquibase-changelog.sql`
(replace `YOURNAME` with your name):

    ```sql
    --changeset YOURNAME:create-author-table
    CREATE TABLE public.author (
        id int8 NOT NULL,
        name varchar(255) NULL,
        CONSTRAINT author_pkey PRIMARY KEY (id)
    );

    --changeset YOURNAME:create-book-table
    CREATE TABLE public.book (
        id int8 NOT NULL,
        title varchar(255) NULL,
        author_id int8 NULL,
        CONSTRAINT book_pkey PRIMARY KEY (id),
        CONSTRAINT book_author_ref FOREIGN KEY (author_id) REFERENCES public.author(id)
    );

    ```

    ??? info "Code Walkthrough"
        - The `-- liquibase formatted sql` line tells Liquibase that we are using regular SQL for our changelog file.
        - Next we mark the beginning of a changeset. Every change we do must be part of a changeset. To differentiate changesets, liquibase uses a combination of the authors name and a description text.
        - Then we write the required DDL statements to create the `Author` and `Book` tables with their fields, keys and constraints.
        - Note that we are creating the `Book` table in a separate changeset. This is a good idea because some operations, such as creating a table, are non-"rollback-able". Having multiple of these operations in one changeset could lead to a changeset being only partially executed if anything goes wrong, potentially leaving our database in an inconsistent state.

    Liquibase will execute the `changesets` in this `changelog` during the start of the application, and will track which changes have been already applied to the corresponding database instance.

1. Run the test again. Success, the DB is now being created from our changeset file.


### 2 - Generated Values

Our test proves we can retrieve books from the repository, but this isn't too exciting if we can't add any.

#### 2.1 Test the Save Method ❌

1. Add a test case called `findAll_bookPersisted_returnsBook` where you:

    1. `save` a book using the repository
    1. `findAll` books
    1. assert that only one book is retrieved
    1. assert this book has the title of the book added previously.

    The class `BookFixtures` provides useful example books for tests via its static methods.

    ??? example "Need help?"

        - to get example books, use the `BookFixtures` class:
        ```Java
        Book cleanCode = BookFixtures.cleanCode();
        ```

        - to assert the size of a list use:
        ```Java
        assertThat(list).hasSize(1);
        ```

        - to assert that two fields are equal, use:
        ```Java
        assertThat(disc.getArtist()).isEqualTo(otherDisc.getArtist());
        ```

1. Run the test

    it should be failing with the error: `ids for this class must be manually assigned before calling save(): com.sap.cc.library.book.Book`.

#### 2.2 Make the Test pass ✔️

The message suggests that we should set an id, but should we set it manually and how can we acquire an id that is guaranteed to be unique?

We should delegate the task of setting id fields to JPA.
While JPA also supports the implementation of custom id generation "strategies" for special cases (outside of the scope of this exercise),
by default, it will assume we want it to acquire an id by working with the database by using sequences or sequence tables, whichever the database supports.

In most scenarios this is the way to go, since the database will be better at generating unique ids than our application.

1. Add the `#!java @GeneratedValue(generator = "BOOK_SEQUENCE")`-annotation on the `Book`'s `id` field


1. Add a changeset to our `liquibase-changelog.sql` which creates the sequence

    ```sql
    --changeset YOURNAME:create-book-sequence
    CREATE SEQUENCE public.BOOK_SEQUENCE
    START WITH 1
    INCREMENT BY 50;
    ```

 1. Run the tests

    They might pass... or they might not. Depending on the order in which the test runner executes your tests (it gives no guarantees with regard to order), the `findAll_noBooks_returnsEmptyList` test will fail as the repository will no longer be empty as a side effect of the `findAll_bookPersisted_returnsBook` test saving a book.

1. Our tests must be independent, therefore in your test class
    1. add a `#!java public void clearDb()`-method
    1. annotate it with `#!java @BeforeEach`
    1. and call the repository's `deleteAll`-method inside.

    !!! warning "@BeforeEach vs. @DirtiesContext and the Spring Context during tests"
        Another option for cleaning the database between tests is `#!java @DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)`. It too can clean up any state we add/apply to the Spring context through test cases. But, it will throw away and re-create the whole Spring context of the application after every single test method (or class). For this exact reason, use this feature sparingly, as it will significantly increase the runtime of your tests.

        More often than not there are other, way more performant, ways of "cleaning up" the state your tests created (e.g. using a `#!java @BeforeEach` method as above, which is a lot faster than using `#!java @DirtiesContext`, especially if you add additional tests)


1. Run the tests again, they should pass now.

### 3 - Repository Methods

The interface `JpaRepository` provides a wealth of generic methods to interact with the database, but none of them supports querying for entity-specific attributes.

#### 3.1 Test the Search 🔍

Write a new test for the `BookRepository` called `findBookByTitle_matchExists_returnsBook` that:

1. saves two books
1. calls the (nonexistent) method `findByTitle`, with one of the books' title as parameter (e.g. `#!java findByTitle("Clean Code")`), on the repository
1. asserts that the returned book's title is equal to that of the matching book.

#### 3.2 Make the Test pass ✅

1. Add a method to the `BookRepository` interface called `findByTitle`.
    It should return a single `Book` and accept a `String` parameter named `title`.

1. Run the test. It should pass.

??? info "What is this magic?"

    Baeldung explains it well in their [Introduction to Spring Data JPA](https://www.baeldung.com/the-persistence-layer-with-spring-data-jpa#1-automatic-custom-queries){target=_blank}:
    >When Spring Data creates a new *Repository* implementation, it analyses all the methods defined by the interfaces and tries to **automatically generate queries from the method names**.
    While this has some limitations, it's a very powerful and elegant way of defining new custom access methods with very little effort.

    Take a look at the [Spring Data JPA reference](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#jpa.query-methods){target=_blank} to learn about the full capabilities of repository methods and find a table of the supported keywords inside method names.

### 4 - Entity Relations

Next we want to be able to persist the `author` field.
The `Author` class is referenced by the `Book` class via the `author` field, but since we added the `#!java @Transient` annotation to it, JPA will not consider it as data that needs to be persisted.

#### 4.1 Test that the Author Gets Saved

Adjust the `findAll_bookPersisted_returnsBook` test in `BookRepositoryTest` to ensure that the author is also persisted.

1. Assert that the `name` of the returned book's `author` is equal to the `name` of the added book's `author`.

1. Run the test.
    The test should be failing due to a `NullPointerException`.
    This is because the book entity, that got persisted to the database, did not include the author property because of the `#!java @Transient`.

#### 4.2 Declare the Relation Book -> Author

Most authors write more than one book.
Instead of duplicating the author information for every book, the books should reference an entry in the `Author` table.

1. Remove the `#!java @Transient` annotation and add a `#!java @ManyToOne` annotation to the `author` property.
    With that we indicate that *many* books can be associated *to one* author.

1. Run the test again.

    It is still failing with the error message
    `@OneToOne or @ManyToOne on com.sap.cc.library.book.Book.author references an unknown entity: com.sap.cc.library.book.Author`

    By adding the `#!java @ManyToOne` annotation, we defined the relation to another entity.
    But so far we haven't specified that `Author` is an entity.

#### 4.3  Make Author an Entity

1. Go to the `Author` class and make it an entity by adding the `#!java @Entity` annotation

1. Add an `id` field of type `Long`, and annotate it with `#!java @Id` and `#!java @GeneratedValue(generator = "AUTHOR_SEQUENCE")` like you did for the Book class earlier.

1. We also need to add a changeset to create the sequence for `Author` to our liquibase-changelog.sql

    ```sql
    --changeset YOURNAME:create-author-sequence
    CREATE SEQUENCE public.AUTHOR_SEQUENCE
    START WITH 1
    INCREMENT BY 50;
    ```

1. Run the tests.
    They are still failing with the message `object references an unsaved transient instance - save the transient instance before flushing`.

    When the `save(book)` method of the `BookRepository` gets called, JPA sees that the book instance carries a reference to an `Author` entity that was not yet persisted.
    Unfortunately it does not (yet) know how to handle this situation.

#### 4.4 Cascade

In order to achieve persistence of child entities along with the parent entity, a cascade type must be specified.

1. Go to the `Book` class and add the `cascade` parameter to the `#!java @ManyToOne` annotation.
    In this case we want to use the `#!java CascadeType.PERSIST` as the value.

    ??? example "Need help?"
        Annotations can have parameters, they are key/value pairs such as in the example below:
        ```Java
        @AwesomeAnnotation(parameterName = parameterValue)
        ```

    ??? question "Why CascadeType.PERSIST?"
        `#!java CascadeType.PERSIST` specifies, that the persist operation is propagated from a parent to a child entity.
        Whenever a book is saved with an `Author` entity that has not been persisted yet, the author should be saved too.
        However, if a book is removed, the associated author should not be removed, as there might be other books with the same author.

1. Run the tests.
    They should be passing now.


### 5 - Wire up a Productive DB

So far we have only worked with a H2 database for our tests (Note that we made sure that H2 is only used by the tests by setting the scope of the H2 maven dependency to `test`).

If you try to run your application using `#!shell mvn spring-boot:run` it should fail due to: `Failed to configure a DataSource: 'url' attribute is not specified and no embedded datasource could be configured.` Spring looks for a database configuration, but finds none.

Let's create a database and wire it up with our application.

#### 5.1 Get a PostgreSQL running with the ease of containers 🐳

Use the following docker command to start a PostgreSQL database:
```shell
docker run --rm --name some-postgres -p 5432:5432 -e POSTGRES_PASSWORD=pw -d postgres:16-alpine
```

#### 5.2 Spring Datasource

Next, Spring wants to know the connection details of the database in order to create a datasource for it.

1. Provide them by adding the following properties to the `application.properties` file **at the root of your project** (where the pom.xml is)
    ```properties
    spring.datasource.url=jdbc:postgresql://localhost:5432/postgres
    spring.datasource.username=postgres
    spring.datasource.password=pw
    spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
    ```

1. Additionally a driver is required, so add the following dependency to your `pom.xml` and trigger a "reload dependencies" in your IDE:
    ```xml
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    ```

1. Run the application using `#!shell mvn spring-boot:run`

    It should start up successfully and then stop as it has nothing else to do :-)

1. Stop the Database using
    ```shell
    docker stop some-postgres
    ```

1. Try running your tests...

    Hm, they are failing because of `java.net.ConnectException: Connection refused`. Looks like they are trying to use the 'productive' PostgreSQL database instead of the H2.


#### 5.3 Fix Test Setup
For simplicity reasons we want to continue using H2 as our database for unit tests.

In order to achieve this:

1. Add the following lines to the "application<b>-test</b>.properties" file in src/<b>test</b>/resources to configure H2 usage
    ```properties
    spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
    spring.datasource.driverClassName=org.h2.Driver
    spring.datasource.username=sa
    spring.datasource.password=
    spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect
    ```

1. Add the annotation `#!java @TestPropertySource(locations = "classpath:/application-test.properties")` to the `BookRepositoryTest` class, in order to tell it to use the configuration file we just filled for the tests in that class.

1. Try running your tests again, they should pass

1. Start the PostgreSQL DB again and try running your application, it should still be using PostgreSQL


!!! info "Why do we need to reconfigure our H2 DB?"
    [Springs "Externalized Configuration" feature](https://docs.spring.io/spring-boot/docs/3.1.1/reference/htmlsingle/#features.external-config){target=_blank} uses a specific order of configuration sources (env variables, property files etc.) to determine the final configuration. Configurations which are parsed earlier in the chain are overwritten by configurations parsed later, this includes our H2 setup which was auto-configured by Spring until we added the PostgreSQL configuration ourselves.

    The configuration in the `application.properties` at the root of the project will overwrite pretty much any other configuration coming from files (see the linked docs for details on the order of precedence).

    To mitigate this, we needed to explicitly provide the configuration we want to use for the tests, and used the `#!java @TestPropertySource` annotation to tell the test class to give precedence to the configuration in our `application-test.properties` file.

!!! warning "Some configurations become part of the jar!"
    The `application.properties` in `src/main/resources` will become part of the jar which is deployed to prod. For this reason you would not want to hard-code any test or local-dev (such as local postgres credentials) configuration there.

    The `application.properties` in the root of the project will **not** be part of the jar file, and should thus contain any configuration which is specific to running your app locally (on your own machine). This is why we provide the local postgres config there.


??? info "Shouldn't we use the same DB for tests as in prod?"
    Yes, it is very much recommended to run tests against the same DB (incl. version) as prod at some stage, but as so often there are tradeoffs w.r.t speed and ease of development.

    - Using an in-memory DB such as H2 for unit tests makes you want to run them more often, simply because execution will be faster
    - Of course, you will need to have smoke tests that use PostgreSQL. This helps to ensure that there are no hidden issues in your scripts or implementation, that work on H2 but not on PostgreSQL. You can achieve this by simply not adding the `#!java @TestPropertySource` annotation to the corresponding test class (in which case the root setting configuring the PostgreSQL will be used).
    - You should also run tests against PostgreSQL in your pipeline. However, there are trade-offs again which database to use for your **unit** tests (higher level tests should definitely use PostgreSQL at this stage)



## 🙌 Congratulations! Submit your solution.

{% with path_name="java/persistence", language="Java", branch_name="persistence" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}

## 🏁 Summary

Good job!
In this exercise you wrote test cases with an embedded database and declared a JPA repository to store and retrieve books. You even added a custom method. In addition you connected the application to a database running in a docker container.

## 🦄 Stretch Goals
You should already have a good idea of all common parts by now, you could stop here... oooor you can finish what you started:

- Create a repository-method that returns all books whose title contains the searched string
- Make Book-Author a `#!java @ManyToMany` relation
- Add an `authoredBooks` attribute to the `Author` entity to make the relation bidirectional

## 📚 Recommended Reading
- [Spring Data JPA documentation](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#repositories.core-concepts){target=_blank}
- [Spring Data JPA @Query for custom queries](https://www.baeldung.com/spring-data-jpa-query){target=_blank}
- [JPA Cascade Types](https://www.baeldung.com/jpa-cascade-types){target=_blank}
- [Bidirectional JPA Relations](https://dzone.com/articles/introduction-to-spring-data-jpa-part-4-bidirection){target=_blank}
- [Flyway](https://flywaydb.org/){target=_blank} 
- [Liquibase](https://www.liquibase.org/){target=_blank}
- [Efficient Java Persistence with JPA course](https://github.wdf.sap.corp/cloud-native-dev/java-persistence/wiki#efficient-java-persistence-with-jpa){target=_blank} (VPN connection required)

## 🔗 Related Topics
- [Hibernate Second-Level Cache](https://www.baeldung.com/hibernate-second-level-cache){target=_blank}
- Use a real database for testing with [TestContainers](https://www.testcontainers.org/){target=_blank}
- [R2DBC Repositories](https://docs.spring.io/spring-data/r2dbc/docs/1.1.2.RELEASE/reference/html/#r2dbc.repositories){target=_blank} - Use Spring Data Repositories in the "reactive" programming model
- [CAP](https://pages.github.tools.sap/cap/docs/java/getting-started){target=_blank}
- [DBeaver - Database Browser](https://dbeaver.io/){target=_blank}
- [SQL vs NoSql Overview](https://www.imaginarycloud.com/blog/sql-vs-nosql/){target=_blank}(Note that some data stores are not offered at SAP and never will be. Internal guidance offered by CPA and Golden Path)



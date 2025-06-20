# Create a Simple REST Endpoint

<!-- TrackingCookie-->
{% with pagename="http-rest-java" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

## 🎯 Learning Objectives

In this exercise you will learn

- how to write test cases using Spring WebMvc Test
- how to create a simple REST endpoint using Spring WebMvc

## 🧠 Theory

- General concepts: [slides](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/httpRest-slides/index.html){target=_blank} ([with speaker notes](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/httpRest-slides/index.html?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_nz6b500z){target=_blank}
- Java Specific: [slides](https://pages.github.tools.sap/EngineeringCulture/ase/Java/spring-web-slides/index.html){target=_blank} ([with speaker notes](https://pages.github.tools.sap/EngineeringCulture/ase/Java/spring-web-slides/index.html?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_1cii8gun){target=_blank}

## 💻 Exercise

We will be following a "test first" approach, so before we write any production code, we will write a test case which tests the behavior we want to have. We will be taking small steps and only implement what we need to get the test to pass. Then we will add another test case which defines additional behavior.

<!-- Prerequisites-->
{% with
  required=[
    '[JUnit](https://junit.org/junit5/docs/current/user-guide/){target=_blank}'
  ],
  beneficial=[
	  '[Spring](https://spring.io/){target=_blank}'
  ]
%}
{% include 'snippets/prerequisites/java.md' %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="http-rest", folder_name="http-rest-java" %}
{% include 'snippets/clone-import/java.md' %}
{% endwith %}

### 🔍 Code Introduction
Since we want to focus on the Spring Web elements in this exercise you will be provided with the shared entity as well as the implementation of a temporary storage. Have a look at the `com.sap.cc.books` package, it contains:

- the class `Book` which is the the entity we will be sharing via REST. It has two fields, `id` and `author`
- the interface `BookStorage` which provides storage and retrieval methods for a `Book`
- the class `InMemoryBookStorage` which provides a default implementation of the `BookStorage` interface based on a HashMap. It is registered with Spring using the `#!java @Component` annotation.

### 1 - Add Spring Web Dependency

The skeleton project does not yet contain any dependencies for Spring Web, so please add the following dependency to your `pom.xml` file and trigger a "reload dependencies" in your IDE:
``` xml
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

### 2 - Set Up Test Class

Create a test class called `BookControllerTest` in your `src/test/java` folder and copy the code snippet below:

```java linenums="1"
package com.sap.cc.books;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
public class BookControllerTest {

	@Autowired
	private MockMvc mockMvc;

}
```

??? info "Code walkthrough"
	- the `#!java @SpringBootTest` annotation registers this test class with Spring Boot which will, among other things, take care of dependency injection for this class
	- the `#!java @AutoConfigureMockMvc` annotation triggers auto-configuration for MockMvc which is then injected below
	- MockMvc will be used to send our "spring-internal" requests to our implementation under test

### 3 - Add GET-All Behavior

#### 3.1 Write a Test Case for GET-All

Write a test case called  `getAll_noBooks_returnsEmptyList` that:

1. sends a GET request to the path `/api/v1/books`
1. expects the response status code `OK` (200)
1. expects an empty json list (`"[]"`) in the response body

??? example "Need help?"
	```java linenums="1"
	import static org.hamcrest.CoreMatchers.containsString;
	import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
	import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

	...

	@Test
	public void getRequestToAwesomePath_returnsAwesome() throws Exception {
		this.mockMvc.perform(get("/my/awesome/path"))
		.andExpect(status().isOk())
		.andExpect(content().string(containsString("Awesome")));
	}
	```

#### 3.2 Run the Tests

{% include 'snippets/run-tests/run-tests-aggregate-java.md' %}

	!!!failure "Since we haven't implemented the required code yet the test will fail."

#### 3.3 Add a RestController Class and GET-All Handler

Let's fix the failing test

1. create a new class called `BookController` in the package `com.sap.cc.books` of your `src/main/java` folder
1. annotate the class with  `#!java @RestController` - This will register the class with Spring Web
1. annotate the class with `#!java @RequestMapping("/api/v1/books")` - This will assign the controller to handle requests for the path specified
1. create a new public method called `getAllBooks` which returns `#!java List<Book>`
1. have the method return `#!java Collections.emptyList()`
1. annotate the method with `#!java @GetMapping` - This will let Spring Web know that this method is supposed to handle GET requests for the path the controller is assigned to. The annotation optionally takes a parameter with a path; This path would then be appended to the path of the controller, we will be doing this in a later step for the getSingle implementation.

#### 3.4 Run the Tests

!!! success "The test should now pass"

### 4 - Add POST (Create) Behavior

#### 4.1 Write Test Case for Creating a Book

Write a test case called `addBook_returnsCreatedBook` that:

1. sends a POST request with content type `application/json` and a Book (in JSON) as the body to the path `/api/v1/books`
1. expects the response to contain the status code `CREATED`(201)
1. expects the `author` of the returned book to match the `author` given in the request
1. expects the  `id` of the returned book to be non-null
1. expects the response to contain a `location` header containing `#!java "/api/v1/books/" + returnedBookId`

??? example "Need help?"
	- you can use the objectMapper to marshall (convert between JSON and Java Object) your book payload
		```java linenums="1"
		// Field at class level, ObjectMapper is provided by Spring Web
		@Autowired
		private ObjectMapper objectMapper;

		// Methods for marshalling and unmarshalling objects to/from json
		String jsonBody = objectMapper.writeValueAsString(anyObject);
		MyObject myObject = objectMapper.readValue(jsonBody, MyObject.class);
		```
	The `MockHttpServletResponse` (see below) provides the response body as (json) String with the method `#!java response.getContentAsString()`
	- you can set the payload and content type with
		```java linenums="1"
		post("/my/awesome/path").content(payload)
			.contentType(org.springframework.http.MediaType.APPLICATION_JSON)
		```
	- you can query the json response by using jsonPath e.g.
		```java linenums="1"
		import static org.hamcrest.CoreMatchers.is;
		import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

		//...
		andExpect(jsonPath("$.title", is("myTitle")))
		```
		although the above should be sufficient for this exercise, you can find more examples [here](https://github.com/json-path/JsonPath#path-examples)
	- you can get the (Mock)Response object by appending `#!java .andReturn().getResponse()`
		```java linenums="1"
		MockHttpServletResponse response = this.mockMvc.perform(get("/my/awesome/path"))
			.andExpect(status().isOk())
			.andReturn().getResponse();
		```

	- you can check that the location header is correct by getting the header from the response and getting the id of the created entity (you may want to unmarshall it as described above to have easy access to its properties)
		```java linenums="1"
		import static org.hamcrest.MatcherAssert.assertThat;
		import static org.hamcrest.CoreMatchers.*;

		assertThat(response.getHeader("location"), is("/my/awesome/path/" + createdEntitiesId));
		```

!!!failure "Since we haven't implemented the required code yet the test will fail."

#### 4.2 Implement Book Creation (POST)

In your `BookController` class:

1. create a new public method called `addBook` which returns `#!java ResponseEntity<Book>` and takes a Book object called `book` as parameter
1. annotate the method with `#!java @PostMapping`
1. add the `#!java @RequestBody` annotation to the `book` parameter of the method - This will let Spring Web know that it should try to create a Book object from the body of the incoming request (which, by default, should contain JSON).
1. copy the `book` parameter into a new method variable called `createdBook`
1. for now, hard code the id of `createdBook` to `#!java 1L`
1. build the `location` header
1. have the method return a `ResponseEntity` with status code `CREATED`(201), the `createdBook` in the body and a valid `location` header

??? example "Need help?"

	- you can use the `UriComponentsBuilder` to construct the URI for the location header
	```java linenums="1"
		UriComponents uriComponents = UriComponentsBuilder
		.fromPath("/my/awesome/path" + "/{id}")
		.buildAndExpand(createdEntity.getId());
		URI locationHeaderUri = new URI(uriComponents.getPath());
	```
	Note that we are using the `getPath()` method to get the relative path to the created resource

	- you can build a `ResponseEntity` by using the static BodyBuilder (🏋️) methods of the `#!java ResponseEntity` class
	```java linenums="1"
		ResponseEntity.created(locationHeaderUri).body(createdEntity);
	```

!!! success "The test should now pass"

### 5 - Add GET-Single Behavior

#### 5.1 Write Test Case for Creating and Getting a Book

Write a test case called `addBookAndGetSingle_returnsBook` that:

1. creates a new Book via a POST request (you may want to extract the creation part from the `addBook_returnsCreatedBook` test case into a separate method for reusability)
1. gets the created book via a GET request - use the content of the location header you receive in the response of the create as the URI for the GET
1. expects the status code of the GET to be `OK`(200)
1. expects the book returned by the GET to match the book returned by the create (POST)

!!!failure "Since we haven't implemented the required code yet the test will fail."

#### 5.2 Start Using BookStorage

Up to now we are not storing anything across requests, lets change that...

1. create a new private field called `bookStorage` of type `#!java BookStorage` in the `BookController` class
1. inject `bookStorage` via "Constructor Injection"
	1. Create a constructor for the `BookController` class and add the parameter `#!java BookStorage bookStorage` .
	1. Within the constructor assign the `bookStorage` parameter to the `bookStorage` field.
1. update the `addBook` method:
	1. `save` the book to the bookStorage and assign the book returned by this operation to `createdBook`
	1. if you haven't already, remove the hard coded assignment of id to 1 - The bookStorage will take care of assigning an id to the book while saving, so it will already be set in the saved book

#### 5.3 Start GET-Single Implementation

1. create a new public method called `getSingle` which takes a Long parameter called `id` and returns `#!java ResponseEntity<Book>`
1. annotate the method with `#!java @GetMapping("/{id}")` - This will register the method to handle requests to /api/v1/books/{id} where the first part of the path is provided by the `RequestMapping` at class level; The two paths are appended to reach the final mapping of the method to the path.
1. add the `#!java @PathVariable("id")` annotation to the `id` parameter of the method. This causes the `id` parameter from the request path, which we defined in the previous step, to be mapped to the method parameter
1. `get` the book with the given `id` from the `bookStorage` and `get()` the book inside the optional
1. return a `ResponseEntity` with status `OK`(200) and the book as the body

!!! success "The test should now pass"

#### 5.4 Write Test Case for GET-Single, Book "not found"

Write a test case called `getSingle_noBooks_returnsNotFound` that:

1. sends a GET request to the path `/api/v1/books/1`
1. expects the response to contain the status code `NOT_FOUND`(404)

!!!failure "Since we haven't implemented the required code yet the test will fail."

#### 5.5 Add "not found" Behavior to getSingle Implementation

Check if the optional returned by the `bookStorage` has a value present, if not have the method return status code `NOT FOUND` (404)

???example "Are your tests still not working?"

	By actually storing the books, we have introduced `state` into the controller. The test cases will always be run in random order, so we will likely have flaky tests due to books potentially already being created by other test cases if we don't clean up 🧹 after ourselves (or before).

	In the test class add:

	```java linenums="1"
	@Autowired
	private BookStorage storage;

	@BeforeEach
	public void beforeEach() {
		storage.deleteAll();
	}
	```

	This will clear our storage before each test case is run, thus clearing the state.
	After adding the cleanup the tests should pass ✅

!!! danger "Continue running the tests after every change. From here on we won't remind you anymore..."

### 6 - Finish GET-All Behavior

#### 6.1 Write Test Case for GET-All After Book Creation

Write a test case called `addMultipleAndGetAll_returnsAddedBooks` that:

1. creates a new Book via a POST request
1. gets all stored Books via a GET-all request
1. expects the status code of the GET-all to be `OK`(200)
1. expects the size of the returned list to be 1
1. expects the book in the list to "be equal" to the book returned by the create (POST)
1. then creates another Book
1. gets all stored Books via a GET-all request
1. expects the status code of the GET-all to be `OK`(200)
1. expects the size of the returned list to be 2

??? example "Need help?"
	Unmarshalling the returned list of books is a bit trickier, we need to use `TypeReference`
	```java
	List<MyObject> myObjects = objectMapper
	.readValue(getAllResponse.getContentAsString(), new com.fasterxml.jackson.core.type.TypeReference<List<MyObject>>() {});
	```

#### 6.2 Update getAllBooks Implementation to Use BookStorage

Update the `getAllBooks` method to `getAll` from bookStorage and return them.


### 7 - Exception Handling

#### 7.1 Write Test Case for Validation and Exception Handling

To show you how to map exceptions to specific behavior in Spring Web we will introduce some proprietary parameter validation into `getSingle` which will throw an exception.

Write a test case called `getSingle_idLessThanOne_returnsBadRequest` that:

1. sends a GET request to the path `/api/v1/books/0`
1. expects the response to contain the status code `BAD_REQUEST`(400)

#### 7.2 Add Validation to getSingle

1. throw an `IllegalArgumentException` with the `Id must not be less than 1` as the message, in case the `id` parameter is less than 1
1. run the test cases - `getSingle_idLessThanOne_returnsBadRequest` should fail.
	- In our test cases we will receive the `IllegalArgumentException` as the root cause.
	- If we run our application and go to [http://localhost:8080/api/v1/books/0](http://localhost:8080/api/v1/books/0){target=_blank} in the browser, the response will be an `INTERNAL_SERVER_ERROR`(500) which is the default return code for any exception thrown during request processing.
1. add a custom exception mapper to map the `IllegalArgumentException` to a `BAD_REQUEST`(400) return code. Simply copy the code below and create the corresponding class
	```java linenums="1"
	package com.sap.cc.books;

	import org.springframework.http.HttpStatus;
	import org.springframework.http.ResponseEntity;
	import org.springframework.web.bind.annotation.ExceptionHandler;
	import org.springframework.web.bind.annotation.RestControllerAdvice;

	@RestControllerAdvice
	public class CustomExceptionMapper {

		@ExceptionHandler
		public ResponseEntity<String> handleBadRequestException(IllegalArgumentException exception) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(exception.getLocalizedMessage());
		}

	}
	```

	??? info "Code walkthrough"
		- the `#!java @RestControllerAdvice` annotation registers this class to advise Spring Web on how to handle different exceptions
		- there can be multiple methods which are annotated with `#!java @ExceptionHandler` - The first parameter (IllegalArgumentException in this case) will let Spring Web know which Exception should be handled
		- The method itself is similar to the methods you implemented in the BookController. It is up to you to define the response behavior - in this example the `BAD_REQUEST`(400) is returned and the exceptions' message is written into the response body (don't do this blindly in your productive code - it is not always a good idea to return exception details to your consumers for security reasons)

	!!! warning "Use Java Validation API for proper validation"
		The way we are doing validation here is cumbersome and only meant to provide a simple example for triggering an exception - don't do this in your productive code. For proper validation handling have a look at the Java Validation API linked in the "Related Topics" section.

1. the tests should now pass

#### 7.3 Add NotFoundException

In some cases you might want to use custom exceptions in your code, Spring Web Provides you with annotations to define the default behavior of those exceptions.
We don't need to add an additional test case, because we already have the test "getSingle_noBooks_returnsNotFound" which specifies our expected behavior. 

1. create a class called `NotFoundException` which extends `#!java RuntimeException` in the package `com.sap.cc.books`
1. add the annotation `#!java @ResponseStatus` with the parameter `#!java HttpStatus.NOT_FOUND` to the `NotFoundException` class
1. update the behavior in the `getSingle` method of the `BookController`; if no Book is found, simply throw the `NotFoundException` instead of manually creating a ResponseEntity.
1. run the tests

We didn't break the external behavior of our endpoint by using this Exception, so all tests should still pass.

This alternative way of creating responses will come in handy at some point, as it gives you more flexibility with regards to execution flow of your code and the return type of your controller method (you won't need to return `#!java ResponseEntity` everywhere)

## 🙌 Congratulations! Submit your solution.

{% with path_name="java/http-rest", language="Java", branch_name="http-rest" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}

{% include 'snippets/line-vs-branch-coverage.md' %}

## 🏁 Summary

Good job!
In this exercise you wrote test cases with MockMvc and implemented the GET, GET-all and POST behavior of a REST endpoint. In addition you implemented your first ExceptionHandler.

## 🦄 Stretch Goals

You should already have a good idea of all common parts by now, you could stop here... oooor you can finish what you started

- return `BAD_REQUEST` (400) if the book in the create (`POST`) has a non-null `id`
- implement "update" (PUT /id)
- return `BAD_REQUEST` (400) if the `id` of the book does not match the `id` in the path in a update (`PUT`) request
- implement "delete" (DELETE /id)
- implement "deleteAll" (DELETE /)

## 📚 Recommended Reading

- [Blog: Exception Handling in Spring MVC](https://spring.io/blog/2013/11/01/exception-handling-in-spring-mvc){target=_blank}
- [More sophisticated exception handling](https://www.baeldung.com/exception-handling-for-rest-with-spring){target=_blank}
- [Spring (Web) MVC](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html){target=_blank}
- [Spring MVC Test (MockMvc) vs End-to-End Integration Tests](https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html#spring-mvc-test-vs-end-to-end-integration-tests){target=_blank}

## 🔗 Related Topics

- [Intro to Spring testing](https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html#testing-introduction){target=_blank}
- [Spring Data REST - Do all of this with less code](https://docs.spring.io/spring-data/rest/docs/current/reference/html/#reference){target=_blank}
- [Java Validation API](https://www.baeldung.com/java-validation){target=_blank}
- <a href="https://pages.github.tools.sap/cap/docs/java/getting-started" target="_blank">CAP - SAP alternative, especially relevant if you are using UI5 which requires OData endpoints</a>
- [Spring Webflux - Reactive alternative to Spring Web](https://docs.spring.io/spring-framework/docs/current/spring-framework-reference/web-reactive.html#spring-webflux){target=_blank}

# Create a Simple REST Endpoint

<!-- TrackingCookie-->
{% with pagename="http-rest-python" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

## 🎯 Learning Objectives
In this exercise, you will learn:

- how to write test cases in Python using `pytest`
- how to create simple REST endpoints using `Flask`

## 🧠 Theory
- General Concepts: [slides](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/httpRest-slides/index.html){target=_blank} ([with speaker notes](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/httpRest-slides/index.html?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_nz6b500z){target=_blank}
- Python Specific: [slides](https://pages.github.tools.sap/EngineeringCulture/ase/Python/flask-slides/index.html){target=_blank} ([with speaker notes](https://pages.github.tools.sap/EngineeringCulture/ase/Python/flask-slides/index.html?showNotes=true){target=_blank})

## 💻 Exercise
To ensure a Test-Driven Development approach, we will begin by writing a test case that verifies the desired behavior. We will be taking rather small steps, implementing only what is necessary to make the test pass. Then we will add more test cases to define additional behaviors.

<!-- Prerequisites-->
{% with
  required=[
      '[Pytest](https://docs.pytest.org/en/latest/contents.html){target=_blank}'
  ],
  beneficial=[
      '[Flask](https://flask.palletsprojects.com/en/3.0.x/){target=_blank}'
  ]
%}
{% include 'snippets/prerequisites/python.md' %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="http-rest", folder_name="http-rest-python" %}
{% include 'snippets/clone-import/python.md' %}
{% endwith %}

{% with folder_name="http-rest-python" %}
{% include 'snippets/python-create-use-virtual-env.md' %}
{% endwith %}

### 🔍 Code Introduction
Since the main focus of this exercise is on `HTTP REST`, we have already provided you with the necessary model and storage implementation to make things easier.

Let's take a look at the `app` folder.

- The `model` folder contains the `book.py` file, which defines the `Book` model.
- The `storage` folder contains the `in_memory_book_storage.py` file, which defines the `InMemoryBookStorage` class, providing an in-memory storage implementation using Python dictionary.

### 1 - Install Flask Dependency
The project does not yet have any dependencies for `Flask`. To add the dependency, you can include the following line in the `requirements.txt` file:

```
flask==3.0.2
```

{% include 'snippets/install-dependencies/python.md' %}

### 2 - Add GET-all Behavior
#### 2.1 Write a Test Case for GET-all

1. Create a file named `test_app.py` under the `test` folder:

    ```python
    import pytest
    from flask import Flask
    from app.app import create_app

    class TestApp:
        @pytest.fixture
        def app(self) -> Flask:
            app = create_app()
            app.config["TESTING"] = True
            return app
    ```

	!!! info "Code walkthrough"
		- The `import`s:
			- the `pytest` dependency allows us to write tests using pytest. The `assert` command is available for use in the tests.
            - the `Flask` dependency is imported to create an instance of the Flask app for testing purposes.
            - the `create_app` is the unit under test. However, the corresponding file and class for this function does not exist yet.

		- Inside the test,
			- the `@pytest.fixture` decorator is used to make a `fixture` that creates and returns a Flask app instance. Any method using `app` as a parameter will automatically get an app instance before its execution.
            - The line `app.config["TESTING"] = True` configures the `app` for testing purposes. Later, we can call `app.test_client()` to obtain an instance of the Flask application's test client. The test client provides a simple interface for simulating requests to the application and inspecting the responses. It allows developers to test the behavior of their Flask application without having to run the server.

Write a test case named `test_get_all_when_no_books_returns_empty_list` that:

1. sends a GET request to the path `/api/v1/books`
1. expects the response status code to be `200` (OK)
1. expects an empty list (`[]`) in the response body

??? example "Need help?"
    - You can send a `GET` request to the test client:
        ```python
        response = app.test_client().get("/my/awesome/path")
        ```
        
        If you want to use other HTTP methods like `POST`, simply replace the `get(...)` method with the appropriate method.
    - To access the response body, you have options like:
        1. use `response.data` to get the raw response data as `bytes`, commonly used when the response content type is not text-based
        1. use `response.text` to get the decoded response data as a string (in some older versions, you can use `response.get_data(as_text=True)` instead)
        1. use `response.json` to parse the JSON response and obtain a Python dictionary or list

#### 2.2 Run the (Failing) Tests
!!! failure "Since we haven't implemented the required code yet, the test will fail."

#### 2.3 Fix the Tests
1. Under the `app` folder, create a new file named `app.py`.
1. Define a function named `create_app` that will be responsible for creating an instance of the `Flask` app.
1. Inside the `create_app`, add a function named `get_all` to be a route handler for the GET endpoint `/api/v1/books`. For now, let the function always return an empty list.

??? example "Need help?"
    Use `@app.route("<endpoint>")` to register a function handling the endpoint.

	```python linenums="1"
    from flask import Flask

    def create_app():
        app = Flask(__name__)
        
        @app.route("/my/awesome/path")
        def get_awesome():
            return "awesome!"

        return app
	```

    The `__name__` is a the name of the current module. The Flask app needs to know that to set up some paths.

#### 2.4 Run the Tests
!!! success "The test should now pass."
        You may have noticed that currently, we are returning an empty list without any logic and without storing the books anywhere. We will write the appropriate tests continuously, then we will need to implement book storage functionality. Let's continue with the next steps.
!!! danger "Continue running the tests after every change, from now on we won't remind you anymore..."

### 3 - Add POST (Create) Behavior
#### 3.1 Write a Test Case for Book Creation
Write a test case named `test_create_a_book` that:

1. sends a POST request to the path `/api/v1/books` with a JSON body including 2 attributes: a `title` and an `author`
1. expects the response status code to be `201` (Created)
1. expects the `title` and `author` of the returned book to match the original values sent in the request
1. expects the `id` of the returned book to be non-null
1. expects the response to contain a `Location` header with value `"/api/v1/books/{returned_book_id}"`

	??? example "Need help?"
		- You can send a payload and expect the content type with:
			```python
            response = app.test_client().post("/my/awesome/path", json=payload)
			```
		- You can check the location response header via:
			```python
            assert location in response.headers.get("Location")
			```
		- To check whether a value exists in the response, or even more precisely via:
			```python
			assert response.json.get("message") == "awesome!"
			```

        Using the `get(...)` method of a dictionary object prevents potential `KeyError`. If the key does not exist in the dictionary, `None` will be returned by default.

!!! failure "Since we haven't implemented the required code yet, the test will fail."

#### 3.2 Implement Book Creation (POST)
Now, let's go back to the `app.py` file.

1. Define a new function in the `Flask` app to handle `POST` requests for the endpoint `/api/v1/books`.
1. Extract the `title` and `author` from the JSON payload.
1. Create a `Book` as a local variable using the extracted `title` and `author`.

    ??? example "Need help?"
        - You have the option to directly return serializable objects e.g. `list`, `dict` in these route handler functions. Flask will automatically convert them into JSON format by `jsonify`.

            ```python linenums="1"
            @app.route("/my/awesome/path")
                def get_awesome_list():
                    return ["hello", "awesome!"]
            ```
        
            Alternatively, you can explicitly use the `jsonify` function to generate a `Response` object.
            ```python linenums="1"
            from flask import jsonify

            response = jsonify({"message": "awesome!"})
            # do something with the response e.g. set a response header
            ```

            Compared with Python's built-in `json`, the `jsonify` function is more suitable for Flask applications. For example, it automatically sets the `Content-Type` header properly, making it easier to work with JSON responses.

        - A class instance in Python stores its instance variables inside the attribute `__dict__`. You can use it to convert the instance into a dictionary.
            ```python linenums="1"
            @app.route("/my/awesome/path", methods=["POST"])
            def post_awesome():
                # skip jsonify, Flask will manage the conversion
                return MessageBoard("awesome!").__dict__, 201
            ```

            We can also create our own method to customize the serialization approach e.g. by including some non-instance variables:

            ```python linenums="1"
            class MessageBoard():
                version = 1.0 # the version is a class variable

                def __init__(self, message: str):
                    self.message = message

                def to_dict(self):
                    return {"message": self.message, "version": self.version}
            ```

1. Assign a hardcoded id `1` to the book for now.
1. Set the `Location` response header to `/api/v1/books/1`.

    ??? example "Need help?"
        ```python
        response.headers["Location"] = "/api/v1/books/1"
        ```

1. Send the response back with the status code `201` (Created).

    ??? example "Need help?"
        ```python
        return response, 201
        ```

!!! success "The test should now pass."

### 4 - Add GET-single Behavior
#### 4.1 Write Test Case for GET-single, Book not Found
Write a test case named `test_get_a_non_existing_book_returns_404` that:

1. sends a GET request to the path `/api/v1/books/1`
1. expects the response status code to be `404` (Not Found)

#### 4.2 Start GET-single Implementation
!!! info "The new test is passing without any production code? 🧐"
        You are right. Flask automatically returns a 404 response if the endpoint is not registered. This means that we are not required to implement anything for this test to pass. However, we will still write some code since we will need it later on anyway.

1. Create a new function to handle `GET-single` requests.
1. Respond with a status code `404` (Not Found).
1. The book id is an integer and passed as a parameter.

    - Let's tell Flask to treat parts of the route as wildcards and extract the value accordingly:

    ```python
    @app.route("/api/v1/books/<int:id>")
    def get_single(id):
        print("The book id is: {book_id}".format(book_id=id))
    ```

### 5 - Utilize InMemoryBookStorage
#### 5.1 Write Test Case for Creating and Getting a Book
Write a test case named `test_create_book_then_get_it_returns_created_book` that:

1. creates a new `Book` object
1. sends a GET request to the path `/api/v1/books/<int:id>` using the value from the `Location` header received in the response
1. expects the status code of the GET to be `200` (OK)
1. expects the book returned by the GET request to match the book returned by the creation (POST)

#### 5.2 Read and Write Books from/to InMemoryBookStorage
Up to this point, we have been hard coding the return values for certain requests. However, for the next test, it would be more practical to store the data on the server side.

To achieve this, we recommend utilizing the provided `InMemoryBookStorage` instead of storing it within the app itself.

1. Create an instance of `InMemoryBookStorage` in the `create_app` function.

1. Update the `POST` handler.

    Instead of always returning fixed values e.g. `book id`, let's store the book in the storage. Construct the response payload based on the returned value of the `save(...)` method.

1. Update the `GET-single` handler.

    Retrieve the book from the storage using the extracted `book id` from the route path:

    - if the book does not exist in the storage, return `404` (Not Found) as before
    - otherwise, return the book with a status code `200` (OK)

#### 5.4 Clean Up After Yourself !!! 🥴

!!! question "Are your tests working?"
	- Which tests are failing - the new ones or older ones?
	- Why are they failing? What did we introduce that might cause the failure?

#### 5.5 Write Test Case for GET-all After Book Creation
Let's test the behavior of combining the `POST (Create)` and `GET-all` operations.

Write a test named `test_create_then_get_all_returns_list_with_created_book` that:

1. creates a book via a `POST` request
1. retrieves all books via a `GET-all` request
1. expects the status code of the `GET-all` to be `200` (OK)
1. expects the size of the returned list to be 1
1. expects the created book to be present in the list
1. creates another book
1. retrieves all books via a `GET-all` request
1. expects the status code of the `GET-all` to be `200` (OK)
1. expects the size of the returned list to be 2
1. expects the second created book to be present in the list

!!! failure "Since we haven't implemented the required code yet, the test will fail."

#### 5.6 Update GET-all Implementation to Use bookStorage
Update the `GET-all` method to retrieve all books from the `InMemoryBookStorage`.

!!! success "The test should now pass."

### 6 - Exception Handling
#### 6.1 Write Test Case for Validation and Exception Handling
To showcase error handling in Flask, we will implement a validation behavior that:

- when creating a book, the `title` is needed
- raise an exception `InvalidBook` when the validation fails

Write a test case named `test_create_a_book_with_empty_title_returns_400` that:

1. sends a `POST` request to the path `/api/v1/books`
    - the JSON body includes a title as an empty string and an author
1. expects the response status code to be `400` (Bad Request)

!!! failure "Since we haven't implemented the behavior yet, the test will fail."

#### 6.2 Implement Validation
1. Implement a new exception class named `InvalidBook`.
1. Within the `POST` route handler, make enhancements that:
    1. add logic to validate the `book title`, which should exist and not be empty
    1. once the validation fails, raise an `InvalidBook` exception
1. Handle the exception by returning a status code `400` (Bad Request)

??? example "Need help?"
    - An error handler in Flask is a function that returns a response when a type of exception is raised. You can create a custom error handler for `InvalidBook`:

        ```python
        class InvalidPath(Exception):
            """
                anything you'd like to set here for an InvalidPath exception
            """

        @app.route("/invalid")
        def invalid_path():
            raise InvalidPath("Invalid path") 

        @app.errorhandler(InvalidPath) 
        def handle_invalid_path(e):
            return "bad request!", 400
        ```

    - You can also let the `InvalidBook` inherit the `werkzeug.exceptions.BadRequest`.

        ??? tips "Werkzeug exceptions"
            The `werkzeug.exceptions` module is a powerful utility library for Python that serves as a fundamental part of the Flask web framework. It provides a collection of exception classes that represent various HTTP errors. These exceptions are utilized to generate HTTP responses with the correct status codes and informative messages.

        This way, you don't need to create a custom error handler since the status code and message is already set by default.

        ```python
        from werkzeug.exceptions import NotImplemented

        class InvalidPath(NotImplemented):
            code = 418 # status code can be specified
            description = "The path is under construction."
        ```

!!! info "Default error page"
    Flask has taken into consideration the default exception handling to prevent information leakage or a poor user experience caused by displaying stack traces of errors. By default, Flask provides a basic error page for common HTTP errors such as `500` (Internal Server Error). Even if we haven't defined any error handler, Flask will display a simple and generic error page when encountering such errors.

## 🙌 Congratulations! Submit your solution.

{% with path_name="python/http-rest", language="Pythonn", branch_name="http-rest-python" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}

## 🏁 Summary
Congratulations on completing this exercise!

You have successfully written test cases and implemented the GET-single, GET-all, and POST behavior for REST endpoints. Additionally, you have learnt error handling in Flask, enhancing the overall functionality of your application.

{% include "snippets/rating-section.md" %}

## 🦄 Stretch Goals
You should already have a good understanding of the common parts by now, but if you want to challenge yourself further, consider implementing additional behaviors such as:

- return a status code `400` (Bad Request) if the book in the creation (`POST`) request body has a non-null `id`
- implement the `update a book by id (PUT /id)` functionality to update an existing book
- return a status code  `400` (Bad Request) if the `id` of the book in the update (`PUT`) request body does not match the `id` in the path
- implement the `delete a book by id (DELETE /id)` functionality
- implement the `delete all (DELETE /)` functionality to delete all books

!!! tips "Redesign book ID generation"
    Consider a redesign of the ID generation process in `in_memory_book_storage.py` to ensure it provides unique, consistent identifiers for books, even in scenarios involving deletion.

Feel free to explore these stretch goals to further enhance your application. Keep up the great work!

## 📚 Recommended Reading
- [Flask: Quickstart](https://flask.palletsprojects.com/en/3.0.x/quickstart/#quickstart){target=_blank}
- [Flask: The Application Factory](https://flask.palletsprojects.com/en/3.0.x/tutorial/factory/#the-application-factory){target=_blank}
- [Flask: Error Handling](https://flask.palletsprojects.com/en/3.0.x/errorhandling/){target=_blank}
- [Flask: Sending Requests with the Test Client](https://flask.palletsprojects.com/en/3.0.x/testing/#sending-requests-with-the-test-client){target=_blank}
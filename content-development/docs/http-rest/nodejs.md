# Create a Simple REST Endpoint

<!-- TrackingCookie-->
{% with pagename="http-rest-nodejs" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

{% include 'snippets/node22-disclaimer.md' %}

## 🎯 Learning Objectives
In this exercise you will learn

- how to write test cases in Node.js using `supertest`
- how to create a simple REST endpoint using Express

## 🧠 Theory
- General Concepts: [slides](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/httpRest-slides/index.html){target=_blank} ([with speaker notes](https://pages.github.tools.sap/EngineeringCulture/ase/AllLanguages/httpRest-slides/index.html?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_nz6b500z){target=_blank}
- Node.js Specific: [slides](https://pages.github.tools.sap/EngineeringCulture/ase/Nodejs/express-slides/index.html?tags=typescript){target=_blank} ([with speaker notes](https://pages.github.tools.sap/EngineeringCulture/ase/Nodejs/express-slides/index.html?tags=typescript&showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_5koirei2){target=_blank}

## 💻 Exercise

We will be following a tests first approach, so before we write any production code, we will write a test case which tests the behavior we want to have. We will be taking rather small steps and only implement what we need to, to get the test working. Then we will add another test case which defines additional behavior.

<!-- Prerequisites-->
{% with
  required=[
    ('[Typescript Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html){target=_blank}'),
  ],
  beneficial=[
	('[Mocha](https://mochajs.org){target=_blank}')
  ]
%}
{% include 'snippets/prerequisites/nodejs.md' %}
{% endwith %}

### 🚀 Getting Started
{% with branch_name="http-rest-ts", folder_name="http-rest-nodejs" %}
{% include 'snippets/clone-import/nodejs.md' %}
{% endwith %}

{% include 'snippets/install-dependencies/nodejs.md' %}

### 🔍 Code Introduction

Since we want to focus on the Express elements in this exercise you will be provided with an implementation of an in-memory storage, and of two types.

- The `src/lib/` folder contains the file `in-memory-book-storage.ts`. Use the `InMemoryBookStorage` as persistence layer for your implementation, that way you don't need to take care of creating and connecting to a test database instance for now and can focus on the web layer. The same file also contains the type definitions for `Book` and `BookPayload`.

- In the `test` folder, there is the respective test suite `in-memory-book-storage.test.ts`
	You can execute the provided tests using the command
	```sh
	npm test
	```

	??? info "Test libraries"
		In `Node.js` there are plenty of test libraries you can use. For this exercise we decided upon using `mocha` as test runner (since it is pretty lightweight) and the built-in `assert` library as - you guessed it - assertion library.
		An alternative assertion library which fits in well together with `mocha` ist called `chai`
		If you are looking for test libraries which include both, test runner and assertion library, we would suggest `jasmine` or `jest`.

- In the `src` folder you can find the `index.ts` file which serves as an entry point to your code. The code in there is executed whenever you run
	```sh
	npm start # builds the `js` folder first and runs the built code
	```
	or
	```sh
	npm run start:dev # does a just-in-time (JIT) transpilation
	```

	!!! failure "Starting the app does not work at the moment"
		Starting the app does not work right now, since the code is requiring a module which does not yet exist (we will create it during the exercise)


### 1 - Install Express Dependency
Within your project folder, run:
```sh
npm install express@4
npm install -D @types/express@4
```
to install the express library including the respective Typescript types as dev dependencies.


### 2 - Add GET-all Behavior

!!! hint "Typescript support"
	In the following exercise steps you will notice a lack of typescript support (mainly) the autocompletion since the provided `express` and `supertest` types only help with built-in types (e.g. autocompletion for method names). Other properties (like `req.body`) will have the [any](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html#any){target=_blank} type.
	For now, just stick with it - we will have a look into this topic later in the exercise.

#### 2.1 Write a Test Case for GET-all

1. Create a file called `app.test.ts` in your `test` folder with the following code:

	```typescript linenums="1"
	import supertest from 'supertest'
	import assert from 'node:assert/strict'
	import createApp from '../src/lib/create-app'

	describe('App', () => {
		it('should return an empty list for all books initially', async () => {
			const client = supertest(createApp())
			const response = await client.get('/my/awesome/path')
				.expect(404)

			assert.deepEqual(response.body, /* shape of response body */)
		})
	})
	```

	??? info "Code walkthrough"
		- `import`s:
			- `supertest` dependency (which is listed as dev dependency within the `package.json` file). This library works well together with `express` and is responsible for simulating http requests.
			- `assert/strict` provides useful assertion functions for tests.
			- `createApp` is the unit under test. The corresponding file does not exist yet.

		- inside the test:
			- we pass an express app (returned from `createApp`) to the `supertest` function to get a client.
			- we use the client to make (fake) http requests to our app.
			- we can declare assertions on the response using `expect`.
			- we can acquire a response object by `await`ing the request.

	Note that, while in `index.ts` a server is started by calling `listen` on the app, when running tests `supertest` will automatically start and stop the app.
	There is no need for you to call `listen` explicitly, just pass the app object to `supertest` (do not start it beforehand) as seen in the code snippet above!

1. Adjust the test, so that it...

	1. sends a GET request to the path `/api/v1/books`
	1. expects the response status code `OK` (200)
	1. expects an empty json list (`[]`) in the response body
	1. expects the `Content-Type` of the response to be `application/json`

	??? example "Need help?"

		You can expect the content type with

		```typescript
		const response = await client.post('/my/awesome/path')
			.expect('Content-Type', /application\/json/u)
		```


#### 2.2 Run the (Failing) Tests
In the terminal, run
```sh
npm test
```

!!!failure "Since we haven't implemented the required code yet the Typescript transpilation will fail."


#### 2.3 Add an App

Let's fix the failing test

1. Create a new file called `create-app.ts` in the `src/lib` directory.
1. Export (default) a single function that creates and returns an `express` app.
1. Add a GET endpoint for `/api/v1/books` which returns an empty list `[]`.

	??? info "Express route methods"
		Express route methods are `HTTP` verbs in lowercase and have the signature

		```typescript
		app.METHOD(PATH, HANDLER)
		```
		More details can be found in the section `Recommended Reading`.

??? example "Need help?"
	Here is one way on how to wrap an express app instance. In the `GET handler` we return an empty object (`{}`), not an empty array!

	```typescript linenums="1"
	import express from 'express'

	export default () => {
		const app = express()

		app.get('/my/awesome/path', (req, res) => {
			res.json({})
		})

		return app
	}
	```

#### 2.4 Run the Tests

!!! success "The test should now pass"
		You may have noticed that we just return an empty array without any logic and without storing the books anywhere. We will be forced to store some books if we write the appropriate tests for it. Let's continue!
!!! danger "Continue running the tests after every change, from here on we won't remind you anymore..."


### 3 - Add POST (create) Behavior

#### 3.1 Write a Test Case for Creating a Book

Write a test case called `should create a book` that:

1. sends a POST request against path `/api/v1/books` with a`BookPayload` as the body. You can import it from `src/lib/in-memory-book-storage`

1. expects the response to contain the status code `CREATED`(201)
1. expects the `title` and `author` of the returned book to match the `title` and `author` of the book sent
1. expects the `id` of the returned book to be non-null
1. expects the response to contain a `location` header with value `"/api/v1/books/${returnedBookId}"`
1. expects the `Content-Type` of the response to be `application/json`

	??? example "Need help?"
		- You can send a payload and expect the content type with
			```typescript
			const response = await client.post('/my/awesome/path')
				.send(payload)
			```
		- You can check the location response header via
			```typescript
			assert.equal(/* location */, response.header.location)
			```
		- To check whether a value is non-null, or to be more precise, `truthy` via
			```typescript
			assert.ok(/* value */)
			```

#### 3.2 Implement Book Creation (POST)

!!! info "Express Middleware"
		In order to make express accept a request body and parse it to json you can use a concept called `express middleware`. A `Middleware` can be called using:

		```typescript
		app.use(middlewareFunction())
		```
		which would register the middleware for all incoming requests.
		A Middleware can also be registered for a certain http method and path like so:

		```typescript
		app.post('/my/awesome/api', middlewareFunction(), (req, res) => {/*...*/})
		```

    	This would register the middleware for the http POST method on the `'/my/awesome/api'` path.
    	You can register several middleware functions for a given method and path. The will be called from top to bottom.
		More details can be found in the section `Recommended Reading`.

		Express has already a built-in function that takes care of parsing the request body to json called `json`.
		We only want to use this middleware for the `POST` endpoint, hence we recommend to use it like the following
		
		```typescript
		app.post('/my/awesome/api', express.json(), (req, res) => {/*...*/})
		```

		The payload can be accessed via `req.body` in the route handler afterwards.


1. Create a new express handler in the app to handle post requests for the api endpoint `/api/v1/books`
1. Get the book -`json` payload via `req.body`
1. Assign an id to the book - you can hard code it to `1` for now
1. Build the `location` header via
```typescript
res.set('Location', '/my/awesome/location')
```
and set a status code via
```typescript
res.status(/* STATUS_CODE */)
```
1. Send the book (including `id`) back to the requestor via
```typescript
res.json(/* book */)
```

??? info "res methods are chainable"
	You can chain the above mentioned methods like so:

	```typescript
	res.set(/* ... */)
		.status(/* ... */)
		.json(/* ... */)
	```

### 4 - Add GET-single Behavior

#### 4.1 Write Test Case for GET-single, Book not Found
Write a test case called `should return 404 for a non-existing book` that:

1. sends a GET request to the path `/api/v1/books/1`
1. expects the response to contain the status code `NOT_FOUND`(404)

#### 4.2 Start GET-single Implementation

!!! info "The new test is passing without production code? 🧐"
		You are right. Express automatically returns a 404 response if the endpoint is not registered. This means we are not forced to implement anything for this test to pass. We will still write some code since we will need this later on anyways.

1. Create a new request handler to handle `GET-single` requests
1. Respond with status code `NOT FOUND` (404)
1. The book id is a wildcard and therefore dynamic. You can tell Express to treat parts of the route as wildcards by using a colon (`:`) like so:
```typescript
app.get('/my/awesome/users/:id', (req, res ) => {...})
```
That way, you can access the actual value of the wildcard through the `params` attribute of the `req` object in the handler:
```typescript
const userId = req.params.id
```

Hint: You won't need to access the request parameter for now.

### 5 - Utilize InMemoryBookStorage

#### 5.1 Write Test Case for Creating and Getting a Book
Write a test case called `should get a single book` that:

1. creates a new Book (you may want to extract the creation part from the create test case)
1. gets the created book via a GET request on path `/api/v1/books/:id` (you could use the content of the location header you receive in the response of the create)
1. expects the status code of the GET to be `OK`(200)
1. expects the book returned by the GET to match the book returned by the create (POST)
1. expects the `Content-Type` of the response to be `application/json`


#### 5.2 Read and Write Books from/to InMemoryBookStorage
Up to now we hard coded the return values. For the next test it makes sense to store the data server-side. You could do this within the app but we recommend to store it in the provided `InMemoryBookStorage`.

1. Inject a `storage` of type `InMemoryBookStorage` via "Dependency Injection" in the `createApp` `function` (Normally, you would use an `interface` to be able to use different book storage implementations, in this exercise however, it is fine to use the exact class instead):
```typescript
export default (storage: InMemoryBookStorage) => {
	//...
}
```
1. Create an `InMemoryBookStorage` instance in your test cases and pass it to the respective `app` (you need to do this for all previous tests as well, otherwise Typescript will not transpile), i.e.
```typescript
import InMemoryBookStorage from '../src/lib/in-memory-book-storage'
//...
it('some test', () => {
	const storage = new InMemoryBookStorage()
	const client = supertest(createApp(storage))
	// ...
})
```

1. Update the `POST` route handlers:

	`save` the book to the bookStorage and adjust the `id` of the returned object (you receive the `id` as return value of the `saveBook` method)

	!!! info "Remember to (a)wait"
		All methods on the bookStorage return promises which have to be `await`ed.
		To be able to use `await` you will have to make the route handler functions `async`.

1. Update the `GET-single` handler:

	`get` the book with the given id from the bookStorage

	1. If the value returned by retrieveBookById is `undefined` return 404 as before
	1. Otherwise return the book with a 200 status code

#### 5.3  Typescript support
As mentioned earlier, there is a lack of typescript support for express related object properties. For instance, the `req.body` is of type `any`.

!!! warning "Typescript and older Node.js packages"
	Many npm packages were created before Typescript received the adoption it has today. This is why the [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped){target=_blank} project was created, where contributors can add types to existing projects. All the `@types/x` packages are generated based on this repository. While the types provided by `DefinitelyTyped` are usually well thought-through, you might sometimes run into issues and "fight" Typescript to make it work with those types.

!!! info "Express Generics"
	If you want to have type support, use the express built-in [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html){target=_blank}.

	The express route methods have [5 different generics](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express/index.d.ts#L120){target=_blank}, the most important ones are

	- `Params` the type of request params
	- `ResBody` the type of the response body
	- `ReqBody` the type of the request body

	Generics can be added to methods or middleware functions like this:

	```typescript
	app.post<Params, ResBody, ReqBody>('/my/awesome/path', (req, res) => {/* */})
	```

	For example:

	```typescript
	import type { RequestHandler } from 'express'
	
	type UserPayload = {
		name: string
	}

	type User = {
		id: string
		name: string
	}
	
	app.post<any, User, UserPayload>('/my/awesome/path', (req, res) => {/* */})

	const validateInput : () => RequestHandler<any, User, UserPayload> = () => (req, res, next) => {
		try {
			// Validate input
		} catch (err) {
			next(err)
		}
	}
	```

	The order of the provided generics is important. But you do not need to specify the latter ones in case they should be defaulted:

	```typescript
	app.get<ParamsType>('/my/awesome/path', async (req, res) => {/* */})
	```


1. Update the POST, GET SINGLE, and GET ALL routes to use generics as well.
	- The GET SINGLE route should get `Params` of type `{ id: string }` and a `ResBody` of type `Book`
	- The GET ALL route should get `Params` of type `unknown` and a `ResBody` of type `Book[]`
	- The POST route should get `Params` of type `unknown`, a `ResBody` of type `Book` and a `ReqBody` of type `BookPayload`
1. Make sure there are no Typescript errors afterwards (e.g. by running `npm run build`, by running `npm test`, or by using your IDE)

!!! warning "Development time vs Runtime"
	Providing explicit types for the `req` and `res` objects only helps during development. If a malicious user would send a malformed body, your application can break if you skip proper validation. Therefore, in a real world application you would validate all external input. We will do this for the `id` param in the `Exception Handling` step, but be aware that the body is still not validated.

#### 5.4 Clean Up After Yourself !!1 🥴

!!!question "Are your tests working?"
	- which tests are failing? - Is it the latest one or older ones?
	- why are they failing? - What did we introduce which might influence older tests?

	???example "Testing and state"

		By actually storing the books, we have introduced `state` into the `InMemoryBookStorage`. The test cases will always be run in random order, so we will likely have flaky tests due to books potentially already being created by other test cases if we don't clean up 🧹 after ourselves (or before).

		We can make use of test `hooks`. You can for example specify a `before`hook to only create one client and one storage instance for the whole test suite:

		```typescript
		describe('App', () => {
			let client: supertest.Agent
			let storage: InMemoryBookStorage

			before(() => {
				storage = new InMemoryBookStorage()
				client = supertest(createApp(storage))
			})
		})
		```

		To solve our concrete problem, we can then introduce a `beforeEach` hook:

		```typescript
		beforeEach(async () => {
			await storage.deleteAllBooks()
		})
		```
		This will clear our storage before each test case is run, thus clearing the state.


#### 5.5 Write Test Case for GET-all After Book Creation
Right now, we are not using our `InMemoryBookStorage` in the `GET-all` handler. Therefore write a test called `should get all stored books` that

1. creates a new Book (if you haven't already in the previous step, you may want to extract the creation part now to minimize code duplication)
1. gets all stored Books via a GET-all request
1. expects the status code of the GET-all to be `OK`(200)
1. expects the size of the returned list to be 1
1. expects the book in the list to match the book returned by the create (POST)
1. then creates another Book
1. gets all stored Books via a GET-all request
1. expects the status code of the GET-all to be `OK`(200)
1. expects the size of the returned list to be 2

#### 5.6 Update GET-all Implementation to Use bookStorage
Update the `GET-all` method to `retrieveAllBooks` from `InMemoryBookStorage` and return them.


### 6 - Exception Handling

#### 6.1 Write Test Case for Validation and Exception Handling
To show you how to handle errors we will introduce some proprietary parameter validation into `GET-single` which will throw an error.

Write a test case called `should return 400 on get single request with invalid id` that:

1. sends a GET request to the path `/api/v1/books/-1` (note the negative number in the parameter)
1. expects the response to contain the status code `BAD_REQUEST`(400)

#### 6.2 Add Validation to GET-single

1. In the `InMemoryStorage`, create a private method `validateId(id: string): void` that checks whether the given parameter `id` is a number and `id > 0`. In case the requirements are not met it should throw an `InvalidParam` error.
1. Call the `validateId` method before you try to get an entry in `retrieveBookById`
1. Wrap the logic in your `GET-single` route handler into a `try-catch` block and pass any error occurring via `next(error)` (available as 3rd argument after `req` and `res`) to the error handler middleware.
1. Write a custom express error handler that catches and checks the type of the error. If the error is an `InvalidParam` instance it should end the request-response cycle with a `BAD_REQUEST` (400) response. Otherwise it should propagate the error via the `next` function to the next error handler.

??? example "Need help?"
    You can

    - parse a string to a number like so:

    ```typescript
    const value = '42'
    Number.parseInt(value)
    // returns 42
    ```

    - check whether a given value is an integer

    ```typescript
    Number.isInteger(value)
    // returns a boolean
    ```

    - create a custom Error via class inheritance

    ```typescript
    export default class CustomError extends Error {
      constructor(message = 'Default message') {
        super(message)
        this.name = this.constructor.name
      }
    }
    ```

    - write an express error handler like so (basically like an express middleware but with an error as first argument). Hint: Put it after the express route methods.

    ```typescript linenums="1"
	import express, { type ErrorRequestHandler } from 'express'

    app.get('/api/v1/books/:id', async (req, res, next) => {
      try {
        const id = req.params.id
        const book = await storage.retrieveBookById(id)
        res
          .status(200)
          .json(book)
      } catch (error) {
        next(error)
      }
    })

    const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
      if (error instanceof CustomError) {
        res
          .status(500)
          .set('Content-Type', 'text/plain')
          .send(error.message)
      } else {
        next(error)
      }
    }

    app.use(errorHandler)
    ```

## 🙌 Congratulations! Submit your solution.

{% with path_name="node/http-rest", language="Node.js", branch_name="http-rest-ts" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}

{% include 'snippets/line-vs-branch-coverage.md' %}

## 🏁 Summary
Good job!
In this exercise you wrote test cases and implemented the GET-single, GET-all and POST behavior of a REST endpoint. In addition you implemented your first express error handler.

## 🦄 Stretch Goals

{% include 'snippets/stretch-goal-disclaimer.md' %}

You should already have a good idea of all common parts by now, you could stop here... oooor you can finish what you started

- Return 400 (Bad request) if the book in the create (POST) has a non-null `id`
- Implement "update"
- Return 400 (Bad request) if the `id` of the book does not match the `id` in the path in a update (PUT) request
- Implement "delete"
- Implement "deleteAll"
- Install [zod](https://github.com/colinhacks/zod){target=_blank} which provides useful functions to validate objects using schemas and generate types out of those schemas.
	1. Remove the `validateId` on `InMemoryStorage` and use `zod` in a dedicated validation middleware instead.
	1. Apply this middleware in the GET single, PUT and DELETE single endpoints
	1. Replace the `Book` and `BookPayload` types using [z.infer](https://github.com/colinhacks/zod#basic-usage){target=_blank}
	1. Add an additional middleware to validate the request body in the POST and PUT endpoint

## 📚 Recommended Reading
- [Basic Express Routing](https://expressjs.com/en/starter/basic-routing.html){target=_blank}
- [Advanced Express Routing](https://expressjs.com/en/guide/routing.html){target=_blank}
- [Express Middleware](https://expressjs.com/en/guide/using-middleware.html){target=_blank}
- [Express Error Handling](https://expressjs.com/en/guide/error-handling.html){target=_blank}

<!-- ## 🔗 Related Topics-->

# Service to Service Communication

<!-- TrackingCookie-->
{% with pagename="service2service-nodejs" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

{% include 'snippets/node22-disclaimer.md' %}

## 🎯 Learning Objectives
In this module you will learn:

- how to make a synchronous call to an existing service
- how to test the service client

## 🧠 Theory

Microservices each run in their own process and therefore need to implement inter-process-communication in order to exchange data or notify one another.
A number of options exist to implement this communication, each with its own set of tradeoffs.
In this module you will learn how to implement inter-process-communication using a RESTful HTTP resource API.

  - General Concepts: [slides](../slides/fundamentals){target=_blank} ([with speaker notes](../slides/fundamentals/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_kslnruyg){target=_blank}
  - Node.js specific: [slides](../slides/nodejs/?tags=typescript){target=_blank} ([with speaker notes](../slides/nodejs/?tags=typescript&showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_n9hv3mzq){target=_blank}

## 💻 Exercise
In this exercise, you will implement the communication to the AsciiArt service located at https://service2service-endpoint.cfapps.eu10.hana.ondemand.com/.

The AsciiArt service provides the functionality to convert strings into ascii art, which we are going to use in the user's "pretty" page (`/api/v1/users/{userId}/page`).

<!-- Prerequisites-->
{% with
  tools=[
    ('**HTTP client** like [Bruno](https://www.usebruno.com/downloads){target=_blank}, a Visual Studio Code extension like [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client){target=_blank}, or [cURL](https://linuxize.com/post/curl-post-request/){target=_blank} (cURL commands are provided)')
  ],
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

{% with branch_name="service2service-ts", folder_name="service2service-nodejs" %}
{% include 'snippets/clone-import/nodejs.md' %}
{% endwith %}

{% include 'snippets/install-dependencies/nodejs.md' %}

1. Now you can run the application using the following command:
    ```shell
    npm start
    ```

    When the Application has started you should be able to see a line similar to the following in the console:
    ```
    Users app listening at http://localhost:3000
    ```

### 🔍 Code Introduction

![Implement AsciiArtServiceClient](./images/0-starting-point-nodejs.svg)

We have set up a simple application that displays users of the application.

There is a GET endpoint provided under `/api/v1/users/{userId}/page` that should display user information in an embellished way, but so far the endpoint only prints the user information as is which is not very pretty.

Additionally there is a GET endpoint provided under `/api/v1/users/{userId}` to get user objects.
Initially there are two users with IDs `0` and `1`.

Node.js' `HTTP` module allows you to make HTTP requests but it is rather low-level and requires a fair amount of boilerplate code. Therefore we are using the new Node.js [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API){target=_blank}.

### 0 - Steps of the Exercise

1. Implement `AsciiArtServiceClient`: 
    - Make the AsciiArtServiceClient call the Ascii Art Service via http
    - Use a mock for the fetch-function in the tests
1. Implement the `PrettyUserPageCreator`
    - Make the PrettyUserPageCreator call the AsciiArtServiceClient, and use the result to build and return a pretty user page
    - Use a mock for the ascii art service client class in the tests
1. Improve integration test
    - Use a mocked http server (using npm module `mockttp`), to conduct the integration test with real http calls
1. Manual Test and Complete Implementation
    - Complete the implementation by wiring everything together and passing the credentials for the AsciiArtService to the client
1. Adapt your application to call a new version of the AsciiArtService and test again

### 1 - Implement the AsciiArtServiceClient

#### 1 - Explore the AsciiArtService

The AsciiArt service team has provided the endpoint specification in their `README.md`.
Go to the [AsciiArt service repo](https://github.tools.sap/cloud-curriculum/s2s-exercise-endpoint){target=_blank} and explore the endpoint specs in the README file.

#### 2 - Test and Implement Successful Call 
![Implement AsciiArtServiceClient](./images/1-implement-ascii-art-service-client.svg)

We want the `AsciiArtServiceClient` class to implement the HTTP communication that enables us to use the AsciiArt service.

Let's modify the existing `should call service` test in `test/ascii-art-service-client.test.ts`.

1. In the test, call `getAsciiString` on the `client` object with `await` and the following object as argument:
    ```typescript
    {
      toConvert: 'Hello World',
      fontId: '1'
    }
    ```
1. Define and export a type called `AsciiArtPayload` in `src/lib/ascii-art-service-client.ts`, which has two properties of type `string`: `toConvert` and `fontId`.

1. Make sure `getAsciiString` in `src/lib/ascii-art-service-client.ts` accepts one argument of type `AsciiArtPayload`.

1. Make the `fetchMock` resolve with a `Response` object. Initialize it with the argument `'{"beautifiedText": "Pretty Hello World", "fontName": "epic"}'`, this is the stringified json response of the AsciiArt service with arbitrary string values.

    ??? example "Need help?"
        See the [documentation](https://developer.mozilla.org/en-US/docs/Web/API/Response/Response){target=_blank} for details on the parameters.

        ```typescript
        fetchMock.resolves(new Response('{"some": "JSONObject"}'))
        ```

1. After calling `getAsciiString`, use the `fetchMock.lastCall.args`-array to assert that the fetch mock was called with the correct parameters:
    - the url is equal to `client.getServicePath()`
    - the `method` property of `init` is `'POST'`
    - the `headers` property of `init` is equal to: `{ 'Authorization': 'Basic dGVzdFVzZXI6dGVzdFBhc3N3b3Jk', 'Content-Type': 'application/json' }` (use the `deepEqual`-function to compare objects)
    - the `body` property of `init` is equal to `'{"toConvert":"Hello World","fontId":"1"}'`

    The `dGVzdFVzZXI6dGVzdFBhc3N3b3Jk` string is the `base64` encoded string of `testUser:testPassword` - we will read the credentials from a `.env` file later.

    ??? example "Need help?"
        ```typescript
        assert.equal(fetchMock.lastCall.args[0], 'calledUri')
        assert.equal(fetchMock.lastCall.args[1]?.method, 'PUT')
        assert.deepEqual(fetchMock.lastCall.args[1]?.headers, {
            'Content-Type': 'application/text'
        })
        assert.equal(fetchMock.lastCall.args[1]?.body, '{"some":"JSONObject"}')
        ``` 

1. Assert that the (`await`ed) result of the call to `getAsciiString` is equal to the `JSON.parse()`d string passed to the `Response` constructor.

1. Run the test to make sure it's failing.

1. Implement the `getAsciiString` method to make the test pass.
    You will need to call `#!typescript this.fetch` with the appropriate arguments. Use the `basicAuthHeader` class property for the basic auth header value.
    The test expects a string for the request body, so make sure to use `JSON.stringify`.
    Then, `await` the response and return `response.json()`.

1. Run the test to make sure it's passing.

#### 3 - Test and Implement Invalid Request Case

The AsciiArt service will return a `HTTP 400 BAD_REQUEST` with invalid request parameters, i.e. unknown `fontId`.
Our service should be able to handle this scenario since the `fontId` is chosen freely by the user during sign-up.

1. Create a new test in `test/ascii-art-service-client.test.ts` called `should throw invalid request exception`.

1. Inside the test, make the `fetchMock` resolve to a `Response` object with the status `400`.

    ??? example "Need help?"
        ```typescript
        fetchMock.resolves(
            new Response('{"error": "I\'m a teapot"}', { status: 418 })
        )
        ```

1. Call `getAsciiString` on the `client` object. You can reuse the argument from the other test.

1. Assert that the returned `Promise` is rejected with an error that has the message "Invalid request" (**Use the exact string literal for the smoke tests**). Note that the `rejects` function from the `assert` module needs to be `await`ed.

    ??? example "Need help?"
        ```typescript
        await assert.rejects(promise, new Error('Expected error message'))
        ```

1. Run the test to make sure it's failing.

1. In the `AsciiArtServiceClient`, throw an `Error` with the message "Invalid request" (**Use the exact string literal for the smoke tests**) if the response's status is `400`.

1. Run the test to make sure it's passing.

### 2 - Implement PrettyUserPageCreator

![Implement PrettyUserPageCreator](./images/2-implement-pretty-user-page-creator.svg)

The service client seems to be ready for use.
We can now obtain the converted ascii art for any string from the AsciiArt-service.

#### 2.1 Adjust a Test
Let's use this feature to convert the name before serving it in the pretty page (`/api/v1/users/{id}/page`) of a user, along with their (plain) phone number.
We want the `PrettyUserPageCreator` to use the `AsciiArtServiceClient` so let's adjust its test first.

1. In `src/lib/ascii-art-service-client.ts`, create the type `AsciiArtServiceResponse` with two `string` properties: `beautifiedText` and `fontName`. This type resembles the returned `json` value of our `getAsciiString` method.

1. Still in `src/lib/ascii-art-service-client.ts`: Create and export an `interface` called `AsciiArtServiceInterface` which has one method `getAsciiString(payload: AsciiArtPayload): Promise<AsciiArtServiceResponse>`.

1. Make the `AsciiArtServiceClient` implement this interface. Make sure the interface and class methods are compatible.

    ??? example "Need help?"
        You need to tell TypeScript about the returned type (note, this could still be a different response, but we are safe since we do have tests in place which verify this)
        ```typescript
        return response.json() as Promise<MyJsonResponseType>
        ```

1. Open `test/pretty-user-page-creator.test.ts` and declare a variable `asciiArtServiceClientMock` in the same scope as `userPageCreator`. The variable should fulfill the `AsciiArtServiceInterface`.

1. Inside the `beforeEach` block, assign an object to `asciiArtServiceClientMock`and define the missing method `getAsciiString(payload: AsciiArtPayload)` which resolves to an arbitrary object of type `AsciiArtServiceResponse`. 

1. Pass the mock to `PrettyUserPageCreator`'s constructor as its parameter.

    The Typescript language server will complain - we will fix that in a moment.

1. Inside the `should create a pretty user page` test, mock the `getAsciiString` method with the following snippet:
    ```typescript
    asciiArtServiceClientMock.getAsciiString = (payload) => {
      assert.deepEqual(payload, {
        toConvert: 'John',
        fontId: '2'
      })
      return Promise.resolve({
        beautifiedText: '"John" written in a pretty way',
        fontName: 'epic'
      })
    }
    ```

1. Replace `John` with `"John" written in a pretty way` in the assertion at the bottom.

1. In order to satisfy Typescript, we update the constructor of `PrettyUserPageCreator` in `src/lib/pretty-user-page-creator.ts`. The argument will be of type `AsciiArtServiceInterface` named `asciiArtServiceClient`.

1. We have broken the `test/application.integration.test.ts` file! Quickly head over there and inject a stub object directly during the `PrettyUserPageCreator` instantiation.

    ??? example "Need help?"
        ```typescript
        new PrettyUserPageCreator({
          getAsciiString: (payload) => Promise.resolve({
            beautifiedText: '',
            fontName: ''
          })
        })
        ```

1. Run the tests. They will fail now.

#### 2.2 Make the Test Pass

1. To assign the constructor argument to a class variable using some Typescript syntactic sugar, add the `private` keyword in front of the variable name.

    ??? example "Need help?"
        ```typescript
        class SomeClass {
          constructor(private injectedObject: SomeInterface) { }
        }
        ```

1. Inside the `createUserPage` function: create an `asciiArtPayload` object like in the following snippet:
    ```typescript
    const asciiArtPayload = {
      toConvert: user.name,
      fontId: user.fontPreference
    }
    ```

1. Acquire the prettified username by calling `getAsciiString` on the `asciiArtServiceClient` with the `asciiArtPayload`.

1. Replace `user.name` with the beautified username in the returned object.

1. Run the tests to make sure it's passing.

### 3 - Improve the Integration Test

#### 3.1 What to Mock?

![Integration Test](./images/3-integration-test.svg)

Back to `test/application.integration.test.ts`! We currently use an inline stub for the test `should create, return user and print a pretty page`. Since this test covers multiple components, using a test double at such a low level might soon become a great maintenance burden and make the test very brittle.
It would be nice if we could somehow mock the external service without needing to inject test doubles into our classes.
Luckily there are packages which let us do just that!


1. Run the following command to install the package `mockttp` which will allow us to mock the Ascii-art-service:
    ```shell
    npm install --save-dev mockttp
    ```

1. Import the dependency into the integration test, using the following code snippet:
    ```typescript
    import * as mockttp from 'mockttp'
    ```

1. Get an instance of `mockServer` and start and stop it using the `beforeEach` and `afterEach` hooks within the `App-integration` block:
    ```typescript
    const mockServer = mockttp.getLocal()

    beforeEach(async () => await mockServer.start())

    afterEach(async () => await mockServer.stop())
    ```

1. Import the class `AsciiArtServiceClient`:
    ```typescript
    import AsciiArtServiceClient from '../src/lib/ascii-art-service-client'
    ```

#### 3.2 Create an AsciiArtServiceClient Instance

1. Inside the test: Create an instance of `AsciiArtServiceClient`.
   You will need to provide two arguments to its constructor:

    1. The `fetch` function, which you can use it directly:

    1. An config object containing properties for `apiUser`, `apiPassword`, and `servicePath`.
        Use the string returned by the following function call for the `servicePath` value:
        ```typescript
        mockServer.urlFor('/asciiArt')
        ```

    ??? example "Need help?"
        ```typescript
        const asciiArtServiceClient = new AsciiArtServiceClient(fetch, {
          apiUser: 'testUser',
          apiPassword: 'testPassword', 
          servicePath: mockServer.urlFor('/mocked-path')
        })
        ```

1. Use the created instance as an argument in the `PrettyUserPageCreator`'s constructor call (replace the inline stub).

1. Before the call to the page endpoint happens, you need to tell the mock-server what to do when it receives a request:
    ```typescript
    await mockServer.forPost('/asciiArt').thenReply(200, JSON.stringify({
      beautifiedText: 'A pretty name',
      fontName: 'epic'
    }))
    ```

1. Replace the first `.*` in the final `match`-assertion with `A pretty name`.

1. Run the tests. All should be passing.

### 4 - Manual Test
The tests increase our confidence that the components work together. But have you actually tried running the application? We can't even build it right now because the app is not yet wired up correctly in `src/index.ts`.

#### 4.1 Read the API Credentials from an .env file
Throughout the exercise we always provided some fake credentials required for the actual `AsciArtService`. 
**Never add credentials directly into the code, and don't commit them!**

1. Create a `.env` file inside the root of your project
1. Immediately afterwards, add the `.env` file to the `.gitignore` file. That way, it will never be commited and only be available locally.
1. Add the credentials to the `.env` file:
    ``` 
    apiUser="ad496250-65b4-4e16-bb26-55ab4e46763f"
    apiPassword="2cd7a62f-e789-447b-a9a1-ca8423f75b99"
    ```
The file will be read upon server start via `src/lib/util/asciiServiceConfig.ts` using the `dotenv` library and will default to dummy credentials in case they are not provided


#### 4.2 Fix the Integration
We fixed the setup in the integration test, but not in the app's actual entry point!

1. Open `src/index.ts` and import `AsciiArtServiceClient`:
    ```typescript
    import AsciiArtServiceClient from './lib/ascii-art-service-client'
    ```

1. Create an instance of `AsciiArtServiceClient`, using the `fetch` as first argument and provide the imported `asciiServiceConfig` as second argument.
<!-- TODO: Why do we need to provide it 2 times? -->

1. Pass the instance to the `PrettyUserPageCreator` constructor call.

1. Run your application and manually test the endpoint `/api/v1/users/{id}/page`.
   You can test with the default users with ids 0 and 1.
   
1. Make sure the coverage thresholds are fulfilled (`npm run coverage`).

You should see the user name displayed in some fancy ascii art.

### 5 - Update the API Version
You have been informed that the API of the AsciiArt service has recently been updated.
The new API is accessible at `/api/v2/asciiArt`.

1. Adjust the `servicePath` in the `src/lib/util/asciiServiceConfig.ts` to target the new API.

1. Restart your application and invoke the endpoint `/api/v1/users/{id}/page` again.

    Are you getting an error? Hm...perhaps the updated endpoint is not working properly.

1. What happens if you invoke the POST-endpoint of the AsciiArt service?

    Invoke the POST-endpoint on `https://service2service-endpoint.cfapps.eu10.hana.ondemand.com/api/v2/asciiArt/` with the JSON-body:
    ```JSON
    {
        "toConvert": "G. Harrison",
        "fontId": "7"
    }
    ```

    ??? Example "Invoke with cURL"
        ```bash
        curl --header "Content-Type: application/json" --header "Authorization: Basic YWQ0OTYyNTAtNjViNC00ZTE2LWJiMjYtNTVhYjRlNDY3NjNmOjJjZDdhNjJmLWU3ODktNDQ3Yi1hOWExLWNhODQyM2Y3NWI5OQ==" --data '{"toConvert": "G. Harrison", "fontId": "7"}' https://service2service-endpoint.cfapps.eu10.hana.ondemand.com/api/v2/asciiArt/
        ```
        Add `-v` or `--verbose` to print additional info like http status code and headers.

1. Seems like the other service's team has broken something.
    Of course the service being broken is something designed in this exercise for illustrative purposes.
    It should induce you to think about following questions:

    - The other team broke the service. Is it their fault that your whole application is not working anymore?
    - How does my service handle the broken communication to other services? Does my service crash?

## 🙌 Congratulations! Submit your solution.

{% with path_name="node/s2s-communication", language="Node.js", branch_name="service2service-ts" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}

## 🏁 Summary
Good job!

You have learned:

* [x] how to call an existing service synchronously from your microservice.
* [x] about the risks of synchronous calls to other services.

## 🦄 Stretch Goals

{% include 'snippets/stretch-goal-disclaimer.md' %}

Not enough? Go ahead and achieve the Stretch Goals:

- Instead of defining your own mocks in the tests, use [sinon](https://sinonjs.org/){target=_blank} instead.

- Implement fallback behavior to deal with the functional outage of the AsciiArt Service.
    - Catch the `Internal Server Error` of the AsciiArt service and introduce your error handling.
    - The pretty page should at least display the users information without layout.

## 📚 Recommended Reading
- [Design Patterns for Microservice-To-Microservice Communication](https://dzone.com/articles/design-patterns-for-microservice-communication){target=_blank}

## 🔗 Related Topics
- [Data Transfer Object (DTO)](https://martinfowler.com/eaaCatalog/dataTransferObject.html){target=_blank}

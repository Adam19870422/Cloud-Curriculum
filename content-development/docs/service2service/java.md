# Service to Service Communication

<!-- TrackingCookie-->
{% with pagename="service2service-java" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

## 🎯 Learning Objectives

In this module you will learn:

- how to make a synchronous call to an existing service
- how to test the service client

## 🧠 Theory

Microservices each run in their own process and therefore need to implement inter-process-communication in order to exchange data or notify one another.
A number of options exist to implement this communication, each with its own set of tradeoffs.
In this module you will learn how to implement inter-process-communication using a RESTful HTTP resource API.

  - General Concepts: [slides](../slides/fundamentals){target=_blank} ([with speaker notes](../slides/fundamentals/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_kslnruyg){target=_blank}
  - Java specific: [slides](../slides/java){target=_blank} ([with speaker notes](../slides/java/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_ssw8402v){target=_blank}

## 💻 Exercise
In this exercise, you will implement the communication to the AsciiArt service located at [https://service2service-endpoint.cfapps.eu10.hana.ondemand.com/](https://service2service-endpoint.cfapps.eu10.hana.ondemand.com/){target=_blank}.

The AsciiArt service provides the functionality to convert strings into ascii art, which we are going to use for the `/api/v1/users/pretty/{userId}` endpoint.

<!-- Prerequisites-->
{% with
  tools=[
    ('**HTTP client** like [Bruno](https://www.usebruno.com/downloads){target=_blank} or [cURL](https://linuxize.com/post/curl-post-request/){target=_blank} (cURL commands are provided)')
  ],
  required=[
      'Basic understanding of [HTTP-RESTful APIs](https://restfulapi.net/){target=_blank}'
  ],
  beneficial=[
      '[Spring](https://spring.io/){target=_blank}'
  ]
%}
{% include 'snippets/prerequisites/java.md' %}
{% endwith %}



### 🚀 Getting Started

{% with branch_name="service2service", folder_name="service2service-java" %}
{% include 'snippets/clone-import/java.md' %}
{% endwith %}

1. Run the application:

    {% with main_class="SpringBootUsersApplication" %}
    {% filter indent(4) %}
    {% include 'snippets/run-application/run-java.md' %}
    {% endfilter %}
    {% endwith %}

    When the Application has started you should be able to see a line similar to the following in the console:
    ```
    2021-06-02 11:51:04.830  INFO 25056 --- [  restartedMain] com.sap.cc.SpringBootUsersApplication    : Started SpringBootUsersApplication in 3.452 seconds (JVM running for 4.34)
    ```

### 🔍 Code Introduction

We have set up a simple application that displays users of the application.

In the `UserController` class there is a GET endpoint provided under `/api/v1/users/pretty/{id}`.
It should display user information in an embellished way, but so far the endpoint only prints the user information "as is", which is not very pretty.

There is also a class called `PrettyUserPageCreator` that is responsible for creating the pretty user page. 


### 1 - Explore the AsciiArt Service

The AsciiArt service team has provided the endpoint specification in their `README.md`.

- Go to the [AsciiArt service repo](https://github.tools.sap/cloud-curriculum/s2s-exercise-endpoint){target=_blank} and explore the endpoint specs in the README file.

### 2 - Create the Entity Representing the Request

Reading the endpoint specification, we saw that the POST endpoint accepts a body with the fields `toConvert` and `fontId`. We will specify a class that represents our request body.

1. Create a class `AsciiArtRequest` in the package `com.sap.cc.ascii`. 

1. Give it two `private` `String`-fields called `toConvert` and `fontId`.

1. Create a constructor to initialize both fields of the class.

1. Add getter methods for both fields, to enable object serialization when using the WebClient.

### 3 - Create the Entity Representing the Response

Reading the endpoint specification, we saw that the endpoint's response contains the fields `beautifiedText` and `fontName`. Let's create a class that represents this response body.

```JAVA
package com.sap.cc.ascii;

public class AsciiArtResponse {

    private String beautifiedText;
    private String fontName;

    public AsciiArtResponse() {
    }

    public AsciiArtResponse(String beautifiedText, String fontName) {
        this.beautifiedText = beautifiedText;
        this.fontName = fontName;
    }

    public String getBeautifiedText() {
        return beautifiedText;
    }

    public String getFontName() {
        return fontName;
    }

}
```

### 4 - Create the AsciiArt Service Client

We will now create a `AsciiArtServiceClient` which implements the HTTP communication to use the AsciiArt service.

1. First we need to add a few dependencies to the `pom.xml`, "webflux" to send requests and the other two for testing:
    ```xml
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webflux</artifactId>
    </dependency>
    <dependency>
        <groupId>com.squareup.okhttp3</groupId>
        <artifactId>okhttp</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>com.squareup.okhttp3</groupId>
        <artifactId>mockwebserver</artifactId>
        <scope>test</scope>
    </dependency>
    ```

1. Create a test class called `AsciiArtServiceClientTest` in the package `com.sap.cc.ascii` (which you may need to create first) of the `src/test/java` directory and insert the code from the following snippet:

    ```JAVA
    package com.sap.cc.ascii;

    import java.io.IOException;

    import org.junit.jupiter.api.AfterAll;
    import org.junit.jupiter.api.BeforeAll;
    import org.junit.jupiter.api.BeforeEach;
    import org.mockito.Mockito;
    import org.springframework.web.reactive.function.client.WebClient;

    import com.fasterxml.jackson.databind.ObjectMapper;

    import okhttp3.mockwebserver.MockWebServer;

    public class AsciiArtServiceClientTest {

        public static final AsciiArtRequest WITH_VALID_ARGS = new AsciiArtRequest("HelloWorld", "3");
        public static final AsciiArtRequest WITH_UNKNOWN_FONT_ID = new AsciiArtRequest("handleThis", "9");

        private AsciiArtServiceUrlProvider asciiArtServiceUrlProvider = Mockito.mock(AsciiArtServiceUrlProvider.class);
        private AsciiArtServiceClient asciiArtServiceClient;
        public static MockWebServer mockBackEnd;
        private ObjectMapper objectMapper = new ObjectMapper();

        @BeforeAll
        static void setUp() throws IOException {
            mockBackEnd = new MockWebServer();
            mockBackEnd.start();
        }

        @AfterAll
        static void tearDown() throws IOException {
            mockBackEnd.shutdown();
        }

        @BeforeEach
        void initialize() {
            String serviceUrl = String.format("http://localhost:%s/api/v1/asciiArt/", mockBackEnd.getPort());
            Mockito.when(asciiArtServiceUrlProvider.getServiceUrl()).thenReturn(serviceUrl);
            asciiArtServiceClient = new AsciiArtServiceClient(WebClient.create(), asciiArtServiceUrlProvider);
        }

    }
    ```

    ??? info "Code walkthrough"
        - `WITH_VALID_ARGS` and `WITH_UNKNOWN_FONT_ID` are some static test fixtures to use in the tests
        - `AsciiArtServiceUrlProvider`: provides the url to our serviceClient, since we need control of the target url we will mock it.
        - `AsciiArtServiceClient`: service client under test
        - `mockBackEnd`: is the mock server our tests will fire requests against. It is initialized and cleared in the before and after methods. [More info here](https://www.baeldung.com/spring-mocking-webclient){target=_blank}.
        - `objectMapper`: We will use the objectMapper to convert objects to their json representation

1. Create the `AsciiArtServiceClient` class in the package `com.sap.cc.ascii` in the `src/main/java` directory using the following snippet:

    ```JAVA
    package com.sap.cc.ascii;

    import org.springframework.beans.factory.annotation.Value;
    import org.springframework.stereotype.Service;
    import org.springframework.web.reactive.function.client.WebClient;
    import org.springframework.web.reactive.function.client.WebClientResponseException;

    import com.sap.cc.InvalidRequestException;

    @Service
    public class AsciiArtServiceClient {

        @Value("${service.ascii.username}")
        private String asciiServiceUsername = "";

        @Value("${service.ascii.password}")
        private String asciiServicePassword = "";

        private final WebClient webClient;
        private final AsciiArtServiceUrlProvider asciiArtServiceUrlProvider;

        public AsciiArtServiceClient(WebClient webClient, AsciiArtServiceUrlProvider asciiArtServiceUrlProvider) {
            this.webClient = webClient;
            this.asciiArtServiceUrlProvider = asciiArtServiceUrlProvider;
        }

        public String getAsciiString(AsciiArtRequest asciiArtRequest) {
            // TODO: implement me
            return null;
        }
    }
    ```

    ??? info "Code walkthrough"
        - We specify the api service path as per the asciiArtService spec
        - with the `@Value` annotation spring will search for [externalized configuration](https://docs.spring.io/spring-boot/docs/2.3.1.RELEASE/reference/html/spring-boot-features.html#boot-features-external-config){target=_blank} parameters with the specified name and use its value during runtime. In order to initialize the values in non-spring tests we also set them to `""`.
        The values will be used to set the authentication header later on.

1. Finally, go to your main class `SpringBootUsersApplication` and create a `WebClient` Bean method using the following snippet:

    ```Java
    @Bean
	public WebClient webClient() {
		return WebClient.builder().build();
	}
    ```

    !!!Warning "Timeouts and Connection Pooling"
        We are omitting important configurations such as Timeouts (Connect, Read, Write etc.) and Connection Pooling (when using blocking requests) in this exercise for simplicities sake. Please make yourself familiar with these important concepts and always apply them when working on production projects. Don't just blindly copy code snippets and assume that they are best practice, we do not guarantee this.


### 5 - AsciiArtServiceClient "Happy Path"

1. Create a new test in `AsciiArtServiceClientTest` called `whenCallingGetAsciiString_thenClientMakesCorrectCallToService`.

1. Call the AsciiArtServiceClient's `getAsciiString()` method (using `WITH_VALID_ARGS` as parameter) and assert that the retrieved result matches the string `"'Hello World' as ascii art"`

1. Run this test. Obviously it is failing since we haven't implemented the AsciiArtServiceClient's behavior yet.

1. In the class `AsciiArtServiceClient` implement the method `getAsciiString()`.
    The method should:
    1. call the `post()` method of the `webClient` 
    1. set the target `uri()`, to the `serviceUrl` provided by the `asciiArtServiceUrlProvider`
    1. add `BasicAuth` to your `headers()` using the `asciiServiceUsername` and `asciiServicePassword`
    1. set the `bodyValue()`
    1. `retrieve()` the result while converting the `bodyToMono()` of type `AsciiArtResponse` using a `block()`-ing call
    1. and lastly return the `beautifiedText` from the received object

    ??? example "Need help?"
        ```Java
        webClient.post().uri("https://www.sap.com")
            .headers(httpHeaders -> httpHeaders.setBasicAuth(USERNAME, PASSWORD))
            .bodyValue(myBodyObject)
            .retrieve()
            .bodyToMono(MyObject.class)
            .block();
        ```

    !!! tip "Sync vs Async"
        In this exercise we are using WebClient in a blocking manner. This means that the thread calling the WebClient will be blocked until the response is received.
        We are doing this for simplicity reasons, as we would need to switch to a reactive programming style to use WebClient in a non-blocking/async manner, which is out of scope for this exercise.

1. Rerun your test. You may notice that the test runs for a really long time. The `mockBackEnd` is not sending a response because we have not told it what to do. Additionally we have not configured any timeouts, so we are waiting forever. Abort/Cancel the test.

1. In order to fix that, we need to tell the `mockBackEnd` how to respond to the request. To do this:
    1. create a `new AsciiArtResponse()`  with `"'Hello World' as ascii art"` as its `beautifiedText`, and `comic` as `fontName`.
    1. from this `AsciiArtResponse` create a JSON-String using the `objectMapper`
    1. have the `mockBackEnd` `enqueue()` a `new MockResponse()` and set the JSON-String as its body
    1. with `addHeader()` specify the message's `Content-Type` as `application/json`. It's a good idea to use framework provided constants for this to avoid typos.

    ??? example "Need help?"
        ```Java
        mockBackEnd.enqueue(new MockResponse()
            .setBody(objectMapper.writeValueAsString(response))
            .addHeader(org.springframework.http.HttpHeaders.CONTENT_TYPE,
                    org.springframework.http.MediaType.APPLICATION_JSON_VALUE));
        ```

1. Rerun your test. It should be passing now.

### 6 - Test and Implement Invalid Request Case

The AsciiArt service will return a `HTTP 400 BAD_REQUEST` for invalid request parameters such as unknown `fontId`s.
Our service should be able to handle this scenario since the `fontId` is chosen freely by the user during sign-up. 

1. In the `AsciiArtServiceClientTest` create a test-method called `whenRequestingWithInvalidRequest_thenInvalidRequestExceptionIsThrown`.

1. As before, use the `enqueue`-method of `mockBackend` to specify the expected behavior at the beginning of the test method. This time the `MockResponse` should have only the `responseCode` set to the value 400.

    ??? example "Need help?"
        ```Java
        mockBackEnd.enqueue(new MockResponse().setResponseCode(418)); //You are not a teapot, so change the value.
        ```

1. Now assert that the `#!java asciiArtServiceClient.getAsciiString(WITH_UNKNOWN_FONT_ID)`-call throws an exception which is an instance of `#!java InvalidRequestException`.
    
    ??? example "Need help?"
        ```Java
        assertThatThrownBy(() -> awesomeCall(awesomeParam))
                .isInstanceOf(AwesomeException.class);
        ```

1. Run the test. It's failing of course due to the missing implementation.

1. In the `AsciiArtServiceClient` class, move the `post`-call inside a try-block and catch the exception of type `WebClientResponseException.BadRequest`.
    Inside the catch-block throw an `InvalidRequestException`.

1. Run the test again. Now it should be passing ✅

### 7 - Use the AsciiArt Service Client
The service client seems to be ready for use.
We can now convert any string value to ascii art by using the AsciiArt-service.

#### 7.1 Adjust a Test
Let's use this feature to convert the user's name before displaying it in the pretty page (`/api/v1/users/pretty/{id}`).

We want the `PrettyUserPageCreator` to use the `AsciiArtServiceClient` so let's adjust its test first.

1. Go to the `PrettyUserPageCreatorTest` class and declare a private field for `AsciiArtServiceClient` and annotate the field with `@Mock`.

1. Change the `prettyUserPageCreator` fields annotation from `@Autowired` to `@InjectMocks` to inject the mocked `AsciiArtServiceClient`.

1. Inside the `shouldCreateAPrettyUserPage` test, mock the `getAsciiString` method using `org.mockito.Mockito` and `org.mockito.ArgumentMatchers`, it should return the String `prettifiedName`

    ??? example "Need help?"
        ```java
        Mockito.when(awesomeMethod(ArgumentMatchers.any())).thenReturn("myString");
        ```


1. Adjust the assertion to expect `"prettifiedName" + "\r\n" + user.getPhoneNumber()` as result of the `getPrettyPage` method call.

1. Run the test to make sure it's failing.

#### 7.2 Make the Test Pass

First you will have to inject the `AsciiArtServiceClient` in the `PrettyUserPageCreator`.

1. Go to `PrettyUserPageCreator` and create a private field of type `AsciiArtServiceClient`.

1. Also add it as a constructor parameter and make sure to initialize the private field inside the constructor body.

1. Inside the `getPrettyPage`-method create a new `AsciiArtRequest` for the user's name, with the corresponding `fontPreference` of the user.

1. Use the `AsciiArtServiceClient`'s `getAsciiString(AsciiArtRequest)`-method to retrieve the ascii art into a variable called `asciiArt`.

1. In the return value of `getPrettyPage`, replace `user.getName()` with the `asciiArt` variable from the previous step.

1. Run the test to make sure it's passing.

### 8 - Fix the Integration Test

We have provided an `IntegrationTest` class containing one test that is currently `#!java @Disabled`.

- Delete the `#!java @Disabled` annotation.

You will notice that integration test `returnsPrettyPage` is failing.
The logs hint towards the cause:
```
...WebClientResponseException$NotFound: 404 Not Found from POST replaceme://example.com/api/v1/asciiArt/
```

If you peek into the file `src/test/resources/application.properties` you will see that the `serviceUrl` is set to `replaceme://example.com/api/v1/asciiArt/`.
This was done to keep the test from calling the live Ascii-Art-Service.
Without this precaution we might be writing tests that depend on the Ascii-Art-Service being reachable, which is a bad idea.

#### 8.1 Use a Mock Server
Tools such as [WireMock](http://wiremock.org/){target=_blank} and [MockWebServer](https://github.com/square/okhttp/tree/master/mockwebserver){target=_blank} allow us to mock external services. Since we are already using MockWebServer for the component test, we will use this for the integration test too.

1. Add a `MockWebServer` to the class `IntegrationTest`
    ```Java
    public static MockWebServer mockBackEnd;

    @BeforeAll
    static void setUp() throws IOException {
	mockBackEnd = new MockWebServer();
	mockBackEnd.start(8181);
    }

    @AfterAll
    static void tearDown() throws IOException {
	mockBackEnd.shutdown();
    }
    ```

1. During the test, the mock-server will accept requests at `http://localhost:8181`, since that's the port we have configured in the `start()` method. 
    Assign the full URL (`http://localhost:8181/api/v1/asciiArt/`) to the property `service.ascii.url` via the `properties` argument of the `@SpringBootTest` annotation.

    ??? example "Need help?"
        ```Java
        @SpringBootTest(properties = { "some.property=someValue" })
        public class SomeClass {
            // ...
        }
        ```

#### 8.2 Define the response
When running the test it will run into a timeout as we didn't tell the MockServer what to do.

1. Specify the expected behavior at the start of the test:
    1. again you need to create a new `AsciiArtResponse`. Set the `beautifiedText` to `"PrettyName"` and `"comic"` as `fontName`.
    1. with `addHeader()` specify the message's `Content-Type` as `application/json`

    !!!Hint "You did something similar before..." 
        You can reuse most of the `#!java mockBackEnd.enqueue(...` stuff you did in the `AsciiArtServiceClientTest`s `whenCallingGetAsciiString_thenClientMakesCorrectCallToService` test.
        While for this exercise it is ok to simply copy and adapt, in productive projects it might be a good idea to create some reusable `test fixtures` in order to not duplicate code which increases maintenance.

1. Adjust the assertion to ensure that the returned pretty page contains `"PrettyName"` before the line breaking characters (`\r\n`).
1. Run the test again. It should now be passing ✅

#### 8.3 Verify outgoing request
Currently we aren't checking if the outgoing request meets the expectations of the API we are calling, let's change that.

1. Add assertions to the end of the test to verify the request method and the requested path
    ```Java
    RecordedRequest request = mockBackEnd.takeRequest();
	assertEquals("POST", request.getMethod());
	assertEquals("/api/v1/asciiArt/", request.getPath());
    ```
1. Run the test again. It should still be passing ✅

### 9 - Manual Test

The tests increase our confidence that the components work together, but have you actually tried running the application?

1. Run your application to manually test the endpoint `http://localhost:8080/api/v1/users/pretty/1`.

    Hm, the app doesn't start, the reason is that we haven't provided configuration for some of the required parameters such as the services url and it's credentials.

1. To provide this information for when we run our application locally, create an `application.properties` file inside the root of your project (where the pom.xml is) and add the following config:

    ```properties
    service.ascii.url=https://service2service-endpoint.cfapps.eu10.hana.ondemand.com/api/v1/asciiArt/
    service.ascii.password=2cd7a62f-e789-447b-a9a1-ca8423f75b99
    service.ascii.username=ad496250-65b4-4e16-bb26-55ab4e46763f
    ```

    Now the app starts and we can...

1. Test again by opening `/api/v1/users/pretty/1` or `/api/v1/users/pretty/2`


!!! info "Externalized Configuration"
    As mentioned earlier, we use [externalized configuration](https://docs.spring.io/spring-boot/docs/2.3.1.RELEASE/reference/html/spring-boot-features.html#boot-features-external-config){target=_blank} to provide configuration parameters that will change depending on where and how we want to run an application. Spring Boot can retrieve such configurations from various sources (environment variables, app startup parameters and properties/yml files). Please see the docs linked above to find out what different sources of configuration there are and more importantly in which order of precedence they are applied.


### 10 - Update the API Version
You have been informed that the API of the AsciiArt service has recently been updated.
The new API is accessible at `/api/v2/asciiArt`.

1. Adjust the `service.ascii.url` configuration property (in the `application.properties` at the root of your project) and replace `/v1/` with `/v2/` in the URL path. This will cause the `webClient` used by the `AsciiArtServiceClient` class to use the new API version of the AsciiArt service.

1. Restart your application and invoke the endpoint `/api/v1/users/pretty/{id}`.

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
        curl --user ad496250-65b4-4e16-bb26-55ab4e46763f:2cd7a62f-e789-447b-a9a1-ca8423f75b99 --header "Content-Type: application/json" --data '{"toConvert": "G. Harrison", "fontId": "7"}' https://service2service-endpoint.cfapps.eu10.hana.ondemand.com/api/v2/asciiArt/
        ```
   
    Add `-v` or `--verbose` to print additional info like http status code and headers.

1. Seems like the other service's team has broken something.
    Of course the service being broken is something designed in this exercise for illustrative purposes.
    It should induce you to think about following questions:

    - The other team broke the service. Is it their fault that your whole application is not working anymore?
    - How does my service handle the broken communication to other services? Does my service crash?

## 🙌 Congratulations! Submit your solution.

{% with path_name="java/s2s-communication", language="Java", branch_name="service2service" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}


## 🏁 Summary
Good job!

You have learned:

* [x] how to call an existing service synchronously from your microservice.
* [x] about the risks of synchronous calls to other services.

## 🦄 Stretch Goals
Not enough? Go ahead and achieve the Stretch Goals:

- Implement fallback behavior to deal with the functional outage of the AsciiArt Service. 
    - Catch the `Internal Server Error` of the AsciiArt service and introduce your error handling.
    - The pretty page should at least display the users information without layout.
- Experiment with asynchronous communication in a reactive way: In the `AsciiArtServiceClient.getAsciiString()` method try using `bodyToFlux` instead of `bodyToMono`.

## 📚 Recommended Reading
- [WebClient](https://www.baeldung.com/spring-5-webclient){target=_blank}
- [Design Patterns for Microservice-To-Microservice Communication](https://dzone.com/articles/design-patterns-for-microservice-communication){target=_blank}
- [Timeouts Explained (StackOverflow)](https://stackoverflow.com/questions/49704708/what-is-a-connection-timeout-during-a-http-request){target=_blank}
- [Setting Timeouts in Webflux/Webclient - Note this is for a newer Spring version (which you should be using)](https://www.baeldung.com/spring-webflux-timeout){target=_blank}
- [WireMock - Powerful alternative to MockServer for Integration Tests](http://wiremock.org/){target=_blank}
## 🔗 Related Topics
- [Data Transfer Object (DTO)](https://martinfowler.com/eaaCatalog/dataTransferObject.html){target=_blank}

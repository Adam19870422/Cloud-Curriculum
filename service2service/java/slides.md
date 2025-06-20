# Service 2 Service Communication
**Java**

<!-- 
Agenda:
- Spring Web Client
- WebClient
    - GET with WebClient
    - POST with WebClient
- WebClient Bean
- Catch the HttpStatusCodeException
- Client-Side Testing
-->

---
### Spring WebClient

`org.springframework.web.reactive.function.client.WebClient`

- Client to perform HTTP requests


Notes:
- Provides simple API to perform HTTP requests
- [WebClient](https://www.baeldung.com/spring-5-webclient)


---
### Async, Non-Blocking, Reactive

- WebClient supports a non-blocking/asynchronous (reactive) approach to perform HTTP requests
- Non-Blocking means that sending the request will not block the main thread
- **Async/Reactive is outside of the scope of this module**, we will be using the client only in a blocking manner.
- If you are interested in async/reactive, please read the WebClient docs and tutorials

---
### WebClient Bean

Spring does not provide a WebClient bean

```java
@Bean
public WebClient webClient() {
    //Warning: Minimal example! 
    //For real world projects you will want to configure timeouts etc.
    return WebClient.builder().build();
}
```

Register a WebClient bean in an @Configuration class, and inject it into your client class

Notes:
- Regarding settings: Connection, Read/Write Timeouts etc. are essential settings in real world projects.


---
### GET with WebClient

```java
String result = webClient
    .get()
    .uri("http://example.com")
    .retrieve()
    .bodyToMono(String.class)
    .block();
```


Notes:

- will perform GET on http://example.com and return the response as `String`
- uri -> The uri to send the request to
- retrieve().bodyToMono(String.class).block() -> will wait for the whole response to be available (thus the *block()*) and parses it into a String object.
- bodyToMono() ? block() ? -> WebClient supports async request processing, we are simply using the blocking implementation for now and during the exercise. Async/Reactive programming is a whole topic in itself which works very differently from what you are used to, so we are not using any of those
capabilities here in order to keep it simple and on-topic.
If you are interested in reactive style async processing please read the webclient docs and tutorials



---
### POST with WebClient

```java
HotelRatingRequest ratingRequest = new HotelRatingRequest();
ratingRequest.setName("Awesome Resort");

HotelRatingResponse result = webClient
    .post()
    .uri("http://example.com")
    .bodyValue(ratingRequest)
    .retrieve()
    .bodyToMono(HotelRatingResponse.class)
    .block();
```

Notes:
- will send the contents of the `HotelRatingRequest` bean and try to parse the response into a `HotelRatingResponse` bean 
- uri -> The uri to send the request to
- bodyValue() -> takes a bean which will be converted into json format and sent as the http body
- retrieve().bodyToMono(HotelRatingResponse.class).block() -> will wait for the whole response to be available (thus the *block()*) and parses it into a HotelRatingResponse object.


---
### Response Error Handling

```java
try {
    webClient
        .get()
        .uri(URI)
        .retrieve()
        .bodyToMono(String.class)
        .block();
} catch (WebClientResponseException.BadRequest e) {
    ...//Handle 400 error here
}
```

Notes:
- the retrieve() method provides automatic error/exception signals (e.g. 4xx and 5xx). In contrast: when using exchange() we need to check the status code manually and handle it accordingly.


---
### Client-Side Testing
Use MockWebServer to mock responses

```java
    //Create a Mock Webserver listening on localhost:8181
	MockWebServer mockBackEnd = new MockWebServer();
	mockBackEnd.start(8181);

    ...

    //Define a response for the first request
    mockBackEnd.enqueue(new MockResponse().setBody("Response from Backend")); 

    //Check that the hotelsServiceClient return the expected result
    assertThat(hotelsServiceClient.getHotels()).isEqualTo("Response from Backend"); 

    //Check that the request received by the mock server was correct
    RecordedRequest recordedRequest = mockBackEnd.takeRequest();
    assertEquals("GET", recordedRequest.getMethod()); 

```

Notes:
- MockWebServer is a scriptable web server. Callers supply canned responses and the server replays them upon request in sequence.
    - takeRequest() awaits the next HTTP request, removes it and returns it.
    - Recorded request can be used to match and validate headers, request protocol, body etc..
- Which test approach is used here? Is this a unit test? Component maybe?

---


# Questions?

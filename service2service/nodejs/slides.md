# Service 2 Service Communication

**Node.js**

<!--
Agenda:
- Node.js HTTP-module
- Fetch API
    - GET with RestTemplate I
    - GET with RestTemplate II
    - POST with RestTemplate I
    - POST with RestTemplate II
- RestTemplate Bean
- RestTemplateBuilder
- Catch the HttpStatusCodeException
- Client-Side Testing
-->

---

### Node.js HTTP-Module

- Node.js provides ways to make http requests in the `http` module(s)
- E.g. [`http.request`](https://nodejs.org/api/http.html#http_http_request_options_callback)

Notes:

- There is a separate module for `https`.
- The request API uses streams, thus it is asynchronous

---

```typescript
import https from 'node:https'

https
  .get('https://example.com/movies.json', (resp) => {
    let data = ''

    // A chunk of data has been received.
    resp.on('data', (chunk) => {
        data += chunk
    })

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
        console.log(`Found ${JSON.parse(data).length} movies.`)
    })

  })
  .on("error", (err) => {
    console.log("Error: " + err.message)
  })
```

Notes:

- How to make a GET request using the `https` module
- What are your thoughts on this piece of code?
- What would you expect in an API for GET requests?

---

### Node.js HTTP-Module

- Fairly low-level
- Boilerplate code
- Need to receive response data in chunks
- Need to pierce chunks together yourself
- Need to parse the response data yourself
- No way to work with Promises

Notes:

- Yes, parsing is trivial if it is JSON formatted but still an extra step
- How can we avoid writing that code every time we need to do a request?
  - Extract it into a more suitable function
  - _Use a library_

---

### Fetch API

- Modern browser API for fetching resources
- Node.js built-in API
- Available in [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)<!-- .element target="_blank" --> and other runtimes: [Cloudflare Workers](https://developers.cloudflare.com/workers/runtime-apis/fetch)<!-- .element target="_blank" -->, [Deno](https://doc.deno.land/builtin/stable#fetch)<!-- .element target="_blank" -->

```typescript
fetch('http://example.com/movies.json')
    .then(response => response.json())
    .then(data => console.log(`Found ${data.length} movies.`))
```

Notes:

- Better abstraction: Usage results in more concise code
- Uses Promises
- There are many http-agent libraries available on NPM, such as [Got](https://www.npmjs.com/package/got), [Axios](https://www.npmjs.com/package/axios) and [SuperAgent](https://www.npmjs.com/package/superagent).
- In your own projects you should make a conscious choice based on the project's requirements.

---

### Parameters

```
fetch(resource [, init])
```

- `resource`: Defines the resource you wish to fetch. Either:
  - URL (string or URL object)
  - Request object
- `init` (Optional): Contains any custom settings you want to apply to the request, e.g.:
  - `method`
  - `headers`
  - `body`

Notes:

- See the [documentation](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) for more details

---

### POST example

```javascript
async function postAnswer(data = {}) {
    const response = await fetch('https://example.com/answer', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return response.text()
}

postAnswer({ answer: 42 })
    .then(data => {
        console.log(data)
    })

```
<!-- .element class="code-xl" data-tags="javascript" -->

```typescript
async function postAnswer(data: { answer: number }): Promise<string> {
    const response = await fetch('https://example.com/answer', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return response.text()
}

postAnswer({ answer: 42 })
    .then(data => {
        console.log(data)
    })

```
<!-- .element class="code-xl" data-tags="typescript" -->

---

### Error Handling

- The promise returned by `fetch` resolves even if the status code is e.g. 400
- `response.status`: status code of the response
- `response.statusText`: message corresponding to status code, e.g. "OK" for `200`
- `response.ok`: true when status is in the range 200-299

Notes:

- The promise returned by `fetch` can also reject, for example when there are connectivity issues.
- See the [documentation](https://developer.mozilla.org/en-US/docs/Web/API/Response) for more details

---

# Questions?

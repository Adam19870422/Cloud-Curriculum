# Asynchronous Programming in Node.js

---

## Motivation

- JavaScript has only one thread

- Synchronously executed code will block the whole script from continuing

- Many long-running operations are I/O operations (disk, network, ...), e.g.:

  ```typescript
  const file = fs.readFileSync('/path-to-huge-file', 'utf-8')
  ```

- The CPU is idle and can continue processing - blocking is a waste of resources

Notes:

- Imagine you have a web-service serving files. If one user requests a huge file, all other users have to wait until that single file has been served.

---

## Callbacks

- Use a callback that gets invoked when the processing is finished (async)

  ```typescript
  fs.readFile('/huge-file.txt', 'utf-8', (error, content) => {
    if (error) {
      throw error
    } else {
      // ... (process the content)
    }
  })
  ```

- *Drawbacks:*
  - Code gets hard to read if we have multiple async calls (need to nest)
  - Do you even see a potential bug here?

Notes:

- When nesting callbacks, mistakes often happen especially in error handling, when errors deep in the callback hierarchy do not bubble up properly.

- `throw` typically doesn't work in callbacks: even if above block was surrounded by a `try/catch`, the `catch` block will not be invoked since the processing already continued beyond the `try/catch`

---

## Nesting Callbacks

- Nesting callbacks often makes code hard to read

- Especially error handling is tricky, often redundant and tends to get forgotten

```typescript
fs.readFile('/path-to-huge-file', 'utf-8', (readFileError, content) => {
  if (readFileError) {
    // ... (error handling)
  } else {
    //... (some processing here)
    http.post('https://thirdparty.org/long-running-operation', (httpPostError, response) => {
      if (httpPostError) {
        // ... (error handling)
      } else {
        // ... (process the response)
      }
    })
  }
})
```

Notes:

- You also cannot simply use `throw Error`

- An asynchronous exception is uncatchable because the intended catch block is not present when the asynchronous callback is executed. Instead, the exception will propagate all the way and terminate the program.

- https://bytearcher.com/articles/why-asynchronous-exceptions-are-uncatchable/

---

## Callback Hell

Some may also call it the **Callback Pyramid of Doom** because of its shape:

```typescript
firstFunction(...args: unknown[], function() {
  secondFunction(...args: unknown[], function() {
    thirdFunction(...args: unknown[], function() {
      fourthFunction(...args: unknown[], function() {
        fifthFunction(...args: unknown[], function() {
          // And so on…
        })
      })
    })
  })
})
```
<!-- .element class="code-xl" data-tags="typescript" -->


```javascript
firstFunction(args, function() {
  secondFunction(args, function() {
    thirdFunction(args, function() {
      fourthFunction(args, function() {
        fifthFunction(args, function() {
          // And so on…
        })
      })
    })
  })
})
```
<!-- .element class="code-xl" data-tags="javascript" -->


Definitely not the best way to write code!

---

## Promises

- Modern way of handling async. tasks

- Allow for clean chaining, error bubbling and parallelization

---

## Promise

A [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) object represents the eventual completion (or failure) of an asynchronous operation and its resulting value.

It is in one of these states:

- **`pending`**: initial state, neither `fulfilled` nor `rejected`.

- **`fulfilled`**: meaning that the operation was completed successfully.

- **`rejected`**: meaning that the operation failed.

---

### Resolve and Reject

A **`pending`** promise can either be **`fulfilled`** with a **`value`** or **`rejected`** with an **`error`**.

- [Promise.then()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then), if the promise is **`fulfilled`**, will be called with the **`value`** as its argument.

- [Promise.catch()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch), if the promise is **`rejected`**, will be called with the **`error`** as its argument.

```typescript
queryDatabase
  .then(databaseResult => console.log('Here is the resolved value: ', databaseResult))
  .catch(databaseError => console.error('Aaaargh an error: ', databaseError))
```

Notes:

- The `then`/`catch` methods can be used to register handlers/callbacks that are invoked whenever the promise `resolves`/`rejects`

- The result of the async operation is passed as argument to the handler

---

## Chaining Promises

- Returning promises (or sync. values) in the `then` block lets you chain promises
    ("thenable")
- The `catch` handler will catch any error along the chain (errors will "bubble")

```typescript
doSomething()
  .then(result => doSomethingElse(result))
  .then(newResult => doThirdThing(newResult))
  .then(finalResult => console.log('Got the final result', finalResult))
  .catch(error => console.error('Something went wrong', error))
```

Notes:

- JavaScript implicitly returns with undefined if no value is explicitly returned

- You can also return synchronous values

---

## Creating Promises

- Constructor accepts a `executor` callback with two arguments: `resolve` and `reject`
- Call `resolve` if the async code executed successfully
- Call `reject` if something went wrong

```typescript linenums="1"
const promise = new Promise((resolve, reject) => {
  doSomething('with some input', (error, value) => {
    if (error) {
      reject(error)
    } else {
      resolve(value)
    }
  })
})
```

Notes:

- Promises are eager, meaning they will run the code within the executor callback immediately on instantiation and not when first consumer registers via `then`

- The value passed to `resolve`/`reject` will be available as argument in the next `then`/`catch` block

- Usually you pass an `Error` object to the reject method

---

## Promisification

- <!-- .element style="float: left; display: block" --> Async functions with the signature 

  ```typescript
  someFunction(...args: unknown[], (err, data) => {
    // ...
  })
  ```
  <!-- .element class="code-xl" data-tags="typescript" -->


  ```javascript
  someFunction(...args, (err, data) => {
    // ...
  })
  ```
  <!-- .element class="code-xl" data-tags="javascript" -->


- <!-- .element style="float: right; margin-left: 3rem; display: block" --> Example:

  ```typescript
  fs.readFile(filename, 'utf-8', (err, data) => {
    // ...
  })
  ```

can be wrapped into promises as shown below:

```typescript
const readFile = (fileName: string) => {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf-8', (error, data) => {
      if (error) {
        reject(error)
      } else {
        resolve(data)
      }
    })
  })
}
```
<!-- .element class="code-xl" data-tags="typescript" -->


```javascript
const readFile = (fileName) => {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf-8', (error, data) => {
      if (error) {
        reject(error)
      } else {
        resolve(data)
      }
    })
  })
}
```
<!-- .element class="code-xl" data-tags="javascript" -->


Notes:
- Since the above function signature is very common, there is even a built-in `promisify` function (within the `utils` module) which does exactly what is shown on the slides

---

## async/await

- Syntactic sugar
- The `async` function automatically wraps returned values into promises
- Every function that uses the `await` keyword must be marked as `async`

```typescript
const getUserNameFromDb = async (id: number) => {
  const user = await queryDbWithUserId(id)
  return user.name
}
```
<!-- .element class="code-xl" data-tags="typescript" -->


```javascript
const getUserNameFromDb = async (id) => {
  const user = await queryDbWithUserId(id)
  return user.name
}
```
<!-- .element class="code-xl" data-tags="javascript" -->


---

## From Promise Syntax to async/await

```typescript
const updateRemoteUser = (id: number) => {
  return getUserFromDb(id)
    .then((user) => {
      return callRemoteUserEndpoint(user)
    })
    .then((result) => {
      logResult(result)
    })
    .catch((err) => {
      handleError(err)
    })
}
```
<!-- .element class="code-xl" data-tags="typescript" -->


```javascript
const updateRemoteUser = (id) => {
  return getUserFromDb(id)
    .then((user) => {
      return callRemoteUserEndpoint(user)
    })
    .then((result) => {
      logResult(result)
    })
    .catch((err) => {
      handleError(err)
    })
}
```
<!-- .element class="code-xl" data-tags="javascript" -->


becomes

```typescript
const updateRemoteUser = async (id: number) => {
  try {
    const user = await getUserFromDb(id)
    const result = await callRemoteUserEndpoint(user)
    logResult(result)
  } catch (err) {
    handleError(err)
  }
}
```
<!-- .element class="code-xl" data-tags="typescript" -->


```javascript
const updateRemoteUser = async (id) => {
  try {
    const user = await getUserFromDb(id)
    const result = await callRemoteUserEndpoint(user)
    logResult(result)
  } catch (err) {
    handleError(err)
  }
}
```
<!-- .element class="code-xl" data-tags="javascript" -->


Notes:

- As mentioned above, `async`/`await` is just syntactic sugar, so the async function `updateRemoteUser` is technically also just a promise

- Error handling via `try-catch`

---

## Advanced Features

- Immediately get a `resolved`/`rejected` promise via

  ```typescript
    Promise.resolve(value)
    Promise.reject(error)
  ```

- Execute several promises concurrently

  ```typescript
    // Promise syntax
    Promise
      .all([promise1, promise2, promise3])
      .then(([value1, value2, value3]) => {
        // proceed
      })
      .catch(error => {
        // handle any error
      })

    // async / await
    try {
      const [value1, value2, value3] =
        await Promise.all([promise1, promise2, promise3])
    } catch (error) {
      // handle any error
    }
  ```

Notes:

- Other method: `Promise.race(promiseArray)`: returns first promise in promiseArray which resolved/rejects with respective value

---

## Further Reading

- [Jake Archibald on Promises](https://web.dev/promises/)

---

## Questions?

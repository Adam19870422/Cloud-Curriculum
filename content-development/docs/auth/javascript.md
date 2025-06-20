# Authentication & Authorization

!!! warning "Not supported"
    This module is currently not working and won't be supported

## 🎯 Learning Objectives

In this module you will learn

- how to login through OpenID Connect
- how to protect a private api
- how to logout


## 🧠 Theory

>When building web applications, one common set of concerns are: How do we prevent unauthenticated users from gaining the access? How can we implement a seamless single sign on experience? And how do we control who can access what information within the web application?

In this module, you will learn about the basics of authentication and authorization:

  - General Concepts: [slides](../slides/fundamentals){target=_blank} ([with speaker notes](../slides/fundamentals/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_e2bghiaw){target=_blank}
  - Node.js specific: [slides](../slides/nodejs){target=_blank} ([with speaker notes](../slides/nodejs/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_w991ugqz){target=_blank}


## 💻 Exercise
In this exercise you will setup authentication & authorization for a simple service.


<!-- Prerequisites-->
{% with
  required=[
    ('[Express](https://expressjs.com)')
  ],
  beneficial=[
	('[Passport](https://www.passportjs.org)')
  ]
%}
{% include 'snippets/prerequisites/nodejs.md' %}
{% endwith %}


### 🚀 Getting Started

{% with branch_name="security", folder_name="security-nodejs" %}
{% include 'snippets/clone-import/nodejs.md' %}
{% endwith %}

{% include 'snippets/install-dependencies/nodejs.md' %}

### 🔍 Code Introduction

As starting point for this exercise you are already provided with a web server implemented using [express](https://expressjs.com){target=_blank}:

- `lib/server.js`: The main entry point for our web server.

- `lib/application.js`: Factory function for creating the express application.

Additionally you will be provided with an [express router](https://expressjs.com/de/4x/api.html#router){target=_blank} for registering authentication related routes and middlewares under `lib/routes/auth.js` throughout this exercise.

Files served using [express.static](https://expressjs.com/de/4x/api.html#express.static){target=_blank} are located under `public`.

Custom error classes can be found under `lib/error`

### 1 - Set up Passport.js

#### 1.1 Installation

1. Run the following command to install the passport dependency:

    ```shell
    npm install passport
    ```

1. We will be using sessions with passport, so install the session dependency as well:

    ```shell
    npm install express-session
    ```

#### 1.2 Setup Serialization

If authentication succeeds, a session will be established and a cookie including an (hard to guess) identifier for the session will be set in the user's browser.
In order to support login sessions, Passport will serialize and deserialize `user` instances to and from the session.
Saving the users in a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) works for now.

1. Create a new file `lib/auth/passport.js` and add the following code:

    ```javascript
    import passport from 'passport'

    const users = new Map()

    passport.serializeUser((user, done) => {
      try {
        const { id } = user
        users.set(id, user)
        done(null, id)
      } catch (error) {
        done(error)
      }
    })

    passport.deserializeUser((id, done) => {
      try {
        const user = users.get(id)
        done(null, user)
      } catch (error) {
        done(error)
      }
    })

    export { passport }
    ```

    !!! info "lib/auth/passport.js"

        We will extend this file further throughout the exercise to encapsulate the [passport](https://www.passportjs.org) related logic for the authentication process.

#### 1.3 Register with Express

In file `lib/routes/auth.js`:

1. Import `express-session` and `lib/auth/passport.js`

    ```javascript
    import session from 'express-session'
    import { passport } from '../auth/passport.js'
    ```

1. Paste the following code into the `auth` function to initialize the session middleware:

    ```javascript
    router.use(session({
        secret: 'super secret string',
        resave: false,
        saveUninitialized: false
    }))
    ```

1. Paste the following code below it to initialize passport and its use of sessions:

    ```javascript
    router.use(passport.initialize())

    router.use(passport.session())
    ```

    ??? example "Need help?"

        File `lib/routes/auth.js`:

        ```javascript
        import express from 'express'
        import session from 'express-session'
        import { passport } from '../auth/passport.js'

        const auth = () => {
          const router = express.Router()

          router.use(session({
            secret: 'super secret string',
            resave: false,
            saveUninitialized: false
          }))

          router.use(passport.initialize())

          router.use(passport.session())

          return router
        }

        export default auth
        ```

    !!! info "lib/routes/auth.js"

        We use an `express` [Router](https://expressjs.com/de/4x/api.html#router) to handle and to encapsulate the authentication process.
        A router can be used as any other middleware

        The `auth` router is being used in `lib/application.js` as the second middleware right after the [morgan](https://github.com/expressjs/morgan) middleware for logging incoming requests.

        So every incoming request will be passed through the `auth` router first and hence authentication will be checked for every incoming request.

### 2 - Add a protected Route

1. Create a new file `lib/routes/me.js`

1. Paste the following code to create a new middleware function:

    ```javascript
    import NotAuthenticatedError from '../error/not-authenticated-error.js'

    export default () => (req, res, next) => {
      const { user, url } = req
      if (!user) {
        const error = new NotAuthenticatedError(`Authentication required for ${url}`)
        next(error)
      } else {
        res
          .status(200)
          .json(user)
      }
    }
    ```

    !!! info "lib/routes/me.js"

        We return a middleware function that will be used as the `/me` route.

        It simply checks if the user is authenticated and if so, returns the user.

        Otherwise, it will throw a `NotAuthenticatedError`.

1. Import and register the middleware function for getting the `/me` path via *HTTP GET* in `lib/application.js`.

    Insert the middleware right after the middleware for *serving the static files* from `public` and before the *error handler*.

    ```javascript
    import me from './routes/me.js'

    // ...

    app.get('/me', me())

    // ...
    ```

    ??? example "Need help?"

        File `lib/application.js`:

        ```javascript
        import { STATUS_CODES } from 'node:http'
        import express from 'express'
        import morgan from 'morgan'
        import auth from './routes/auth.js'
        import me from './routes/me.js'

        export default () => {
          const app = express()

          app.use(morgan('dev'))

          app.use(auth())

          app.use('/', express.static('public'))

          app.get('/me', me())

          app.use(({ message, code = 500 }, req, res, next) => {
            console.error(message)
            res
            .status(code)
            .set('Content-Type', 'text/plain')
            .send(STATUS_CODES[code])
          })

          return app
        }
        ```

1. Stop and restart the app with the following command (if not running `npm run watch` already)

    ```shell
    npm start
    ```

1. Navigate to [localhost:3000/me](http://localhost:3000/me).

    You should receive a [401 Unauthorized](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401) response.

    !!! info "401 Unauthorized"

        Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated".

        That is, the client must authenticate itself to get the requested response.

### 3 - Add the Login

We have a route that requires authentication, but no way to authenticate yet.

Let's use [Passport-OpenID Connect](https://www.passportjs.org/packages/passport-openidconnect/) strategy to authenticate with the [SAP Identity Authentication (IAS)](https://help.sap.com/viewer/product/IDENTITY_AUTHENTICATION/Cloud/en-US).

#### 3.1 Set up OpenID Connect Client

1. Run the following command to install the OpenID Connect client:

    ```shell
    npm install openid-client@4
    ```

1. Create a new file `lib/auth/openid.js` and paste the following code:

    ```javascript
    import { Issuer, Strategy } from 'openid-client'

    const ENDPOINT = 'https://aghtrtxzy.accounts400.ondemand.com'
    const CLIENT_ID = '2a30e426-b564-4313-a4a3-e3e4d6c88050'

    const { metadata } = await Issuer.discover(ENDPOINT)
    const issuer = new Issuer(metadata)

    const { Client } = issuer
    const client = new Client({
      client_id: CLIENT_ID,
      client_secret: 'g/CmJZ?8gTD-7PSuG/lYs_8Uq:jT=Jy',
      redirect_uris: [
        'http://localhost:3000/login/callback'
      ],
      post_logout_redirect_uris: [
        'http://localhost:3000/logout/callback'
      ]
    })

    const verify = (tokenSet, done) => {
      try {
        const claims = tokenSet.claims()
        const { sub: id, first_name: firstname, last_name: lastname, email } = claims
        const user = {
          id,
          firstname,
          lastname,
          email
        }
        done(null, user)
      } catch (error) {
        done(error)
      }
    }
    const strategy = new Strategy({ client }, verify)

    export { client, strategy, CLIENT_ID }
    ```

    ??? info "Code Walkthrough"
        - `Issuer`: Encapsulates an OpenID Connect Issuer, Identity Provider or Authorization Server and its metadata.
            The required URIs can be found on a `.well-known/openid-configuration` path.
            E.g. for our SAP IAS: [https://aghtrtxzy.accounts400.ondemand.com/.well-known/openid-configuration](https://aghtrtxzy.accounts400.ondemand.com/.well-known/openid-configuration).
        - `Client`: Holds the methods for getting an authorization URL, consuming callbacks, triggering token endpoint grants, revoking and introspecting tokens.
        - `Strategy`: Generic OpenID Connect Passport authentication middleware strategy.
            Admits a parameter object and a `verify` callback.
            The `verify` callback calls done with the object that represents the user for the session.
        - `tokenSet.claims()`: Returns an array of claims from the decoded id token.

1. In file `lib/auth/passport.js`

    - import the exported `client`, `strategy`, and `CLIENT_ID` from `lib/auth/openid.js`

    - configure `passport` to use the `strategy` for `oidc`

    - export `client` and `CLIENT_ID`

    ```javascript
    import { client, strategy, CLIENT_ID } from './openid.js'

    // ...

    passport.use('oidc', strategy)

    // ...

    export { passport, client, CLIENT_ID }
    ```

    ??? example "Need help?"

        File `lib/auth/passport.js`:

        ```javascript
        import passport from 'passport'
        import { client, strategy, CLIENT_ID } from './openid.js'

        const users = new Map()

        passport.use('oidc', strategy)

        passport.serializeUser((user, done) => {
          try {
            const { id } = user
            users.set(id, user)
            done(null, id)
          } catch (error) {
            done(error)
          }
        })

        passport.deserializeUser((id, done) => {
          try {
            const user = users.get(id)
            done(null, user)
          } catch (error) {
            done(error)
          }
        })

        export { passport, client, CLIENT_ID }
        ```

#### 3.2 Add the Login Endpoint

In file `lib/routes/auth.js`

1. Add a new middleware for the `/login` path via *HTTP GET* using the `passport.authenticate(<strategy>)` method for the `oidc` strategy.

    ```javascript
    router.get('/login', passport.authenticate('oidc'))
    ```

1. Add a new middleware for the `/login/callback` path via *HTTP GET* using the `passport.authenticate(<strategy>, <options>)` method for the `oidc` strategy, providing the `successRedirect` and `failureRedirect` options.

    ```javascript
    router.get('/login/callback', passport.authenticate('oidc', {
      successRedirect: '/me',
      failureRedirect: '/'
    }))
    ```

1. Add the following forms to `public/index.html`:

    ```html
    <form action="/login">
      <input type="submit" value="Login">
    </form>
    <form action="/logout">
      <input type="submit" value="Logout">
    </form>
    ```

    ??? example "Need help?"

        File `lib/routes/auth.js`:

        ```javascript
        import express from 'express'
        import session from 'express-session'
        import { passport } from '../auth/passport.js'

        const auth = () => {
          const router = express.Router()

          router.use(session({
            secret: 'super secret string',
            resave: false,
            saveUninitialized: false
          }))

          router.use(passport.initialize())

          router.use(passport.session())

          router.get('/login', passport.authenticate('oidc'))

          router.get('/login/callback', passport.authenticate('oidc', {
            successRedirect: '/me',
            failureRedirect: '/'
          }))

          return router
        }

        export default auth
        ```

        File `public/index.html`:

        ```html
        <form action="/login">
          <input type="submit" value="Login">
        </form>
        <form action="/logout">
          <input type="submit" value="Logout">
        </form>
        ```

#### 3.3 Authenticate

1. Stop and restart the app with the following command (if not running `npm run watch` already)

    ```shell
    npm start
    ```

1. Navigate to [localhost:3000](http://localhost:3000) and click the `Login` button.

1. Use the following credentials to log in:
    - username: `regular`
    - password: `Pa$$word`

You should be redirected to [localhost:3000/me](http://localhost:3000/me) and see the user's data because you are authenticated now.

```json
{"id":"P000009","firstname":"Robin","lastname":"Regular","email":"ygzolomfhdreyjqrvk@bptfp.com"}
```

### 4 - Add the Logout

In file `lib/routes/auth.js`

1. Import the `client` from `lib/auth/passport.js`

    ```javascript
    import { passport, client, CLIENT_ID } from '../auth/passport.js'
    ```

1. Add a new middleware for the `/logout` path via *HTTP GET* to redirect the response to the client's `endSessionUrl`

    ```javascript
    router.get('/logout', (req, res) => {
      res.redirect(client.endSessionUrl({ client_id: CLIENT_ID }))
    })
    ```

1. Add a new middleware to for the `/logout/callback` path via *HTTP GET* to terminate the login session and to redirect to the start page.

    ```javascript
    router.get('/logout/callback', (req, res, next) => {
      req.logout((err) => {
        if (err) {
          return next(err)
        }
        res.redirect('/')
      })
    })
    ```

1. Stop and restart the app with the following command (if not running `npm run watch` already)

    ```shell
    npm start
    ```

1. Navigate to [localhost:3000](http://localhost:3000/) and click the `Logout` button.

1. Click the `Login` button.

You should be required to enter your credentials again.

??? example "Need help?"

    File `lib/routes/auth.js`:

    ```javascript
    import express from 'express'
    import session from 'express-session'
    import { passport, client, CLIENT_ID } from '../auth/passport.js'

    const auth = () => {
      const router = express.Router()

      router.use(session({
        secret: 'super secret string',
        resave: false,
        saveUninitialized: false
      }))

      router.use(passport.initialize())

      router.use(passport.session())

      router.get('/login', passport.authenticate('oidc'))

      router.get('/login/callback', passport.authenticate('oidc', {
        successRedirect: '/me',
        failureRedirect: '/'
      }))

      router.get('/logout', (req, res) => {
        res.redirect(client.endSessionUrl({ client_id: CLIENT_ID }))
      })

      router.get('/logout/callback', (req, res, next) => {
        req.logout((err) => {
          if (err) {
            return next(err)
          }
          res.redirect('/')
        })
      })

      return router
    }

    export default auth
    ```

### 5 - Authorization

#### 5.1 Install JWT Utility

Whenever we read from a [JWT](https://jwt.io) we should also verify the signature to make sure that it was created by the identity provider and no one else has meddled with it.

The `oidc` strategy does that only for the id token.
Therefore we can simply access its payload through the `claims` method on the `tokenSet`.

However, if we want to read the access token we have to verify it ourselves.

1. Execute the following command to install the [jose](https://github.com/panva/jose) dependency, which offers utility functions for dealing with [JWTs](https://jwt.io):

    ```shell
    npm install jose@4
    ```

2. Import the `jwtVerify` function in file `lib/auth/openid.js`:

    ```javascript
    import { jwtVerify } from 'jose'
    ```

#### 5.2 Read the Access Token

The `user` object is constructed inside the `verify` callback, which is passed to the `Strategy` constructor in file `lib/auth/openid.js`.
To verify the `access token` (`jwt`) we need the `public key` from the `identity provider`.
It can be acquired from the `keystore` of the `issuer`.

1. You can acquire the `keystore` with the following code:

    ```javascript
    const verify = async (tokenSet, done) => {
      try {
        const { access_token: jwt } = tokenSet
        const keystore = await issuer.keystore()
        const { keyObject: publicKey } = keystore.get()
        // TODO: verify the access token
      } catch (error) {
        done(error)
      }
    }
    ```

1. Next we need call the `jwtVerify` function passing the `jwt` and the `publicKey`:

    ```javascript
    const { payload } = await jwtVerify(jwt, publicKey, {
      issuer: issuer.metadata.issuer,
      audience: client.client_id
    })
    ```

    If successful `payload` will contain the decoded payload of the access token with the user's data, including the user's `roles`.

    ```javascript
    const { sub: id, first_name: firstname, last_name: lastname, email, groups: roles } = payload
    const user = {
      id,
      firstname,
      lastname,
      email,
      roles: Array.isArray(roles) ? roles : [roles]
    }
    done(null, user)
    ```

    ??? example "Need help?"

        File `lib/auth/openid.js`:

        ```javascript
        import { Issuer, Strategy } from 'openid-client'
        import { jwtVerify } from 'jose'

        const ENDPOINT = 'https://aghtrtxzy.accounts400.ondemand.com'
        const CLIENT_ID = '2a30e426-b564-4313-a4a3-e3e4d6c88050'

        const { metadata } = await Issuer.discover(ENDPOINT)
        const issuer = new Issuer(metadata)
        const { Client } = issuer
        const client = new Client({
          client_id: '2a30e426-b564-4313-a4a3-e3e4d6c88050',
          client_secret: 'g/CmJZ?8gTD-7PSuG/lYs_8Uq:jT=Jy',
          redirect_uris: [
            'http://localhost:3000/login/callback'
          ],
          post_logout_redirect_uris: [
            'http://localhost:3000/logout/callback'
          ]
        })

        const verify = async (tokenSet, done) => {
          try {
            const { access_token: jwt } = tokenSet
            const keystore = await issuer.keystore()
            const { keyObject: publicKey } = keystore.get()
            const { payload } = await jwtVerify(jwt, publicKey, {
              issuer: issuer.metadata.issuer,
              audience: client.client_id
            })
            const { sub: id, first_name: firstname, last_name: lastname, email, groups: roles } = payload
            const user = {
              id,
              firstname,
              lastname,
              email,
              roles: Array.isArray(roles) ? roles : [roles]
            }
            done(null, user)
          } catch (error) {
            done(error)
          }
        }
        const strategy = new Strategy({ client }, verify)

        export { client, strategy, CLIENT_ID }
        ```

#### 5.3 Check a User's Roles

1. Restart the application.

1. Log in as the user **`regular`**. Does it have any `roles`?

    [http://localhost:3000/me](http://localhost:3000/me) `{ "roles": [ /* ??? */ ]}`

1. Try logging in as the following user:

    - username: `privileged`

    - password: `Pa$$word2`

    What role(s) does the **`privileged`** user have?

    ??? example "Need help?"

        The  **`regular`** use has the `roles`: `[ 'USER' ]`,

        Whereas the **`privileged`** user has the `roles`: `[ 'USER', 'ADMIN' ]`.

#### 5.4 Add a restricted Route

The `/restricted` route should only be accessible to users with the `ADMIN` role.

1. Create a new file `lib/routes/restricted.js`

1. Check whether the user is authenticated, the same way it is done in the `/me` endpoint.

1. Check whether the user is authorized by checking if the `user.roles` includes the `ADMIN` role.

    Otherwise throw an `NotAuthorizedError`.

    ```javascript
    import NotAuthorizedError from '../error/not-authorized-error.js'

    if (!user?.roles.includes('ADMIN')) {
      const error = new NotAuthorizedError(`Authorization required for ${url}`)
      next(error)
    }
    ```

1. Import and register the middleware function for getting the `/restricted` path via *HTTP GET* in `lib/application.js`.

    ??? example "Need help?"

        File `lib/routes/restricted.js`:

        ```javascript
        import NotAuthenticatedError from '../error/not-authenticated-error.js'
        import NotAuthorizedError from '../error/not-authorized-error.js'

        export default () => (req, res, next) => {
          const { user, url } = req
          if (!user) {
            const error = new NotAuthenticatedError(`Authentication required for ${url}`)
            next(error)
          } else if (!user?.roles.includes('ADMIN')) {
            const error = new NotAuthorizedError(`Authorization required for ${url}`)
            next(error)
          } else {
            res
              .status(200)
              .json(user)
          }
        }
        ```

        File `lib/application.js`:

        ```javascript
        import { STATUS_CODES } from 'node:http'
        import express from 'express'
        import morgan from 'morgan'
        import auth from './routes/auth.js'
        import me from './routes/me.js'
        import restricted from './routes/restricted.js'

        export default () => {
          const app = express()

          app.use(morgan('dev'))

          app.use(auth())

          app.use('/', express.static('public'))

          app.get('/me', me())

          app.get('/restricted', restricted())

          app.use(({ message, code = 500 }, req, res, next) => {
            console.error(message)
            res
              .status(code)
              .set('Content-Type', 'text/plain')
              .send(STATUS_CODES[code])
          })

          return app
        }
        ```

#### 5.5 Test the Authorization

1. Restart the application.

1. Try accessing [localhost:3000/restricted](http://localhost:3000/restricted) with both users: `regular` and `privileged`.

Is the authentication working as expected?

!!! info "403 Forbidden"

    The HTTP 403 Forbidden response status code indicates that the server understands the request but refuses to authorize it.

    This status is similar to 401, but for the 403 Forbidden status code re-authenticating makes no difference. The access is permanently forbidden and tied to the application logic, such as insufficient rights to a resource.

## 🙌 Congratulations! Submit your solution.

{% with path_name="node/auth", language="Node.js", branch_name="security" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}


## 🏁 Summary

Good job!
In this exercise you used OpenID Connect to delegate authentication and read the access token to authorize an endpoint.

## 📚 Recommended Reading

- [Passport: The Hidden Manual](https://github.com/jwalton/passport-api-docs#passport-the-hidden-manual)
- [OAuth and OpenID Connect in Plain English (VIDEO)](https://www.youtube.com/watch?v=sSy5-3IkXHE)

## 🔗 Related Topics

- [Passport Strategies](https://www.passportjs.org/)
- [SAP IAS Docs](https://help.sap.com/viewer/6d6d63354d1242d185ab4830fc04feb1/LATEST/en-US/d17a116432d24470930ebea41977a888.html)
- [CP Security Knowledge-Base](https://github.wdf.sap.corp/pages/CPSecurity/Knowledge-Base/)
- The [Application Security Engagement and Enablement Team](https://sap.sharepoint.com/sites/124611) offers learning resources and trainings for secure programming and hacking 

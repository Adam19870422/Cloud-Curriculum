# Authentication & Authorization in Node.js

---

## Passport

- Authentication middleware
- Support for several ways of authentication through "strategies" abstraction

---

### Basic Use

```javascript
// register a strategy
passport.use('myStrategy', new Strategy())
```

```javascript
// register the passport middleware
app.use(passport.initialize())
// invoke it with .authenticate()
app.get('/login', passport.authenticate('myStrategy'))
app.get('/protected', (req, res) => {
    if(!req.isAuthenticated) { return res.status(401).end('Not authenticated!') }
    res.send('Hello!')
})
```

---

### Sessions

- After successful authentication, Passport will establish a persistent login session.
- When used with express, a session middleware is needed, e.g. `express-session`
- Callbacks for serializing and deserializing user information into and out of the session must be provided

```javascript
passport.serializeUser( (user, done) => done(null, user))
passport.deserializeUser( (user, done) => done(null, user))
app.use(expressSession({ ... }))
app.use(passport.initialize())
app.use(passport.session())

```

Notes:

- The example serializes the user into its JSON representation.

---

### Strategies

- Strategies require a *verify callback*

```javascript
new Strategy(params, (info, done) => {
    const user = { id: info.userId, name: info.preferred_name }
    return done(null, user)
})
```

- `user` is what will be persisted in the session and assigned to `req.user`.

Notes:

- Contents of `params` and `info` depend on the strategy.
- `done` is an "error-first callback". Use `null` for the first argument to indicate success.

---

## OpenID Client

- OpenID client implementation which supports passport

```javascript
import { Issuer, Strategy } from 'openid-client'

const idProvider = new Issuer({
    issuer: 'example.com',
    authorization_endpoint: 'example.com/auth',
    token_endpoint: 'example.com/token',
    jwks_uri: 'example.com/certs'
})
const client = new idProvider.Client({
    client_id: 'my-client',
    client_secret: 'some-secret-key',
    redirect_uris: [ `http://${hostname}/login/callback` ]
})
passport.use('oidc', new Strategy({ client: client }, (tokenSet, done) => { ... }))
```

Notes:

- The verify callback receives the token set, usually including id token, access token and [refresh token](https://auth0.com/docs/secure/tokens/refresh-tokens/use-refresh-tokens).

---

## Jose

- Provides utility functions for handling JWTs
- Used by OpenID client (same maintainer)

```javascript
 import { jwtVerify } from 'jose'

const { payload } = await jwtVerify(jwt, publicKey, {
  issuer: issuer.metadata.issuer,
  audience: client.client_id
})
```

Notes:

- Only the id token is verified by the strategy. The other tokens need to be verified manually.
- `payload` contains the decoded claims.
- The public key is required to verify the signature on the JWT

---

# Questions?

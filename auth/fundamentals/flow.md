# Beforehand
- App and IdP share client-id and client-secret
- App knows the location-uri of the IdP

# Login
- User navigates to app
- Clicks Login
- WebApp redirect to IdP (optionally with `code_challenge` (hash of `code_verifier`)) with callback URI
- User logs in with his credentials to IdP
- IdP redirects to callback URI and appends code (& state? TODO) as path variables
- App performs POST to IdP
    - Header: authorization: Basic &lt;base64-encoded clientID & clientSecret&gt;
    - Body:
        - code
        - `code_verifier` (optional)
- IdP returns Authentication JWT token to app 
- App saves token in session and returns session id to user (does some kind of mapping JWT to Session??)

# Requests after login
- User makes request with session-id attached
- app retrieves token from session to authenticate
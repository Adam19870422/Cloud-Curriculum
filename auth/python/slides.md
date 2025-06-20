# Authentication & Authorization in Python

---

## Authlib with Flask

- Authentication & Authorization Framework for Flask applications
- Supports OAuth and OpenID Connect

Notes:
- A `Flask` application is built with the Flask framework, a simple and flexible Python web framework. Its ease of use and adaptability make it a favorite for creating web applications and APIs.
- The `Authlib` is a authentication and authorization library designed for Python apps.
    - It offer robust support for protocols e.g.
        1. [The OAuth 1.0 Protocol](https://docs.authlib.org/en/latest/specs/rfc5849.html)
        1. [The OAuth 2.0 Authorization Framework](https://docs.authlib.org/en/latest/specs/rfc6749.html)
        1. [JSON Web Token](https://docs.authlib.org/en/latest/specs/rfc7519.html)
        1. [OIDC: OpenID Connect 1.0](https://docs.authlib.org/en/latest/specs/oidc.html)
    - And it seamlessly integrate with popular Python web app frameworks e.g. Flask, Django ...

References:
- [Authlib: Get Started](https://docs.authlib.org/en/latest/)
- [Authlib: Flask OAuth Client](https://docs.authlib.org/en/latest/client/flask.html)

---

### About Configuration

- Using Authlib to implement OAuth and OpenID Connect is convenient but not fully out of the box -- additional setup and code is needed.

Notes:
- Unlike Java Spring Security, which provides a default security configuration out of the box, Authlib does not automatically secure a Flask application just by being installed and configured. 
- You need to explicitly configure the authentication and authorization flow, manage sessions and tokens, and design protection on your endpoints using e.g. decorators or middleware.

---

### Benefits of Using Authlib

- `Simplification`: Authlib abstracts the complexities of handling OAuth and OpenID Connect flows.
- `Security`: Helps you implement secure authentication and authorization mechanisms.
- `Extensibility`: Easily integrate with multiple OAuth providers and customize as per your requirements.

Notes:
- Authlib makes it easier to implement secure authentication and authorization
    - rich framework integration: Flask, Django, FastAPI, HTTPX ...
    - rich support on social network service connections: Google, Twitter, GitHub ...
- (Easy to use) It is designed to be monolithic, which prevents disruptions, adapting to specification changes seamlessly so that users don't have to manage these complexities themselves.
- (Flexible) It is flexible. If the existing high-level solutions don't fit the needs, users can tailor one using its low-level foundational components.

References:
- [Authlib: Homepage](https://authlib.org/)
- [Authlib: Security](https://docs.authlib.org/en/latest/community/security.html)

---

### Securing a Flask Application with Authlib

```python
# Installation
pip install Authlib
```

```python
from authlib.integrations.flask_client import OAuth

# Configure the OAuth client in your Flask application.
oauth = OAuth(app)
oauth.register(
    name = 'sap',
    server_metadata_url = f'{BASE_URL}/.well-known/openid-configuration',
    client_kwargs = {
        'scope': 'openid'
    }
)
```

1. Install the [Authlib](https://docs.authlib.org/en/latest/basic/install.html).
1. Register the app with the OAuth provider to obtain client credentials.
1. Configure the OAuth client.

Notes:
The 2nd step is not the focus point here. In real life, we need to consider like:
1. register the app with the provider
1. retrieve the client credentials safely from the providers

The 3rd step:
- `OAuth(app)` initializes an OAuth object using the provided Flask app.
    - we can also use `oauth.init_app(app)` to do a late initialization
- `oauth.register(...)` registers an OAuth client with specific configurations. 
    - `name='sap'`: declares a unique name to identify the OAuth client configuration.
    - `server_metadata_url='...'`: declares a URL points to the configuration metadata of the OAuth provider. Info e.g. supported endpoints, scopes... can be found in certain metadata.
    - `client_kwargs={...}`: specifies extra arguments for the client configuration.
        - Here, the `scope` is declared to be `'openid'`, which indicates the OpenID Connect (OIDC) authentication -- which typically includes retrieving user profile information.

References:
- [Authlib: Flask OAuth Client](https://docs.authlib.org/en/latest/client/flask.html#)

---

### Login Flow (1/2)

```python
@app.route('/login')
def login():
    redirect_url = url_for('callback', _external=True)
    return app.oauth.sap.authorize_redirect(redirect_url)
```

Initiating the OAuth login process

Notes:
- `authorize_redirect(redirect_url)` redirects the user to the authorization endpoint of the OAuth provider. The `redirect_url` is provided as the callback URL where the provider will send the user back after they grant or deny authorization.
- Here, we generates a URL to the `/callback` route using `url_for(...)`
    - enabling `_external` ensures the URL is fully formed, including the domain and schema
    - => the URL will be absolute used for callback later

References:
- [Authlib: Routes for Authorization](https://docs.authlib.org/en/latest/client/flask.html#routes-for-authorization)

---

### Login Flow (2/2)
```python
@app.route('/callback')
def callback():
    token = app.oauth.sap.authorize_access_token()
    """ Example token data structure (SAP IAS):
        {   
            "access_token": "...",
            "token_type": "Bearer",
            "expires_in": 3600,
            "expires_at": 1723090347,
            "userinfo": {
                "sub": "P000009",
                "iss": "https://abc.accounts400.ondemand.com",
                "groups": "USER",
                "first_name": "Robin",
                "last_name": "Regular",
                "email": "ygzolomfhdreyjqrvk@bptfp.com",
                ...
            }
        }
    """
    session['user'] = token['userinfo']
    return redirect(url_for('index'))
```

Handle the callback from the OAuth provider after the user has authorized the application

Notes:
- `authorize_access_token()` method exchanges the authorization code (received as a query parameter) for an access token.
- `session` in Flask is a dictionary-like data structure that allows for the storage and retrieval of user session data across requests.
    - `session['user'] = token['userinfo']` stores the user information (extracted from the token)
- The user is then redirected to the home route using `redirect(url_for('home'))`.

References:
- [Authlib: Routes for Authorization](https://docs.authlib.org/en/latest/client/flask.html#routes-for-authorization)

---

### Logout Flow

```python
from urllib.parse import urlencode

@app.route('/logout')
def logout():
    # clear the session from the app side
    session.pop('user', None)

    # logout from the provider
    callback_url = url_for('index', _external=True)
    params = urlencode({
        'client_id': CLIENT_ID,
        'post_logout_redirect_uri': callback_url
    })
    logout_url = f'{BASE_URL}/oauth2/logout?{params}'
    return redirect(logout_url)
```

Log out a user both in the app and from the provider (SAP IAS) side.

[SAP IAS: Call Identity Authentication End Session Endpoint](https://help.sap.com/docs/cloud-identity-services/cloud-identity-services/call-identity-authentication-end-session-endpoint?q=logout)

Notes:
Logout from the OIDC provider side is needed because:
- it ensures the user's session is terminated not only in the application but also with the authentication provider.
- => this protects against potential session hijacking or reuse of credentials

Code Walkthrough:
- `session.pop(...)` removes the data from the session.
- `url_for('index', _external=True)` generates the absolute callback URL to redirect the user after logout.
- The client ID can be retrieved from the app's configuration (`config.py`).
    - Authlib Flask OAuth registry can load the configuration from Flask `app.config` automatically ([Read more](https://docs.authlib.org/en/latest/client/flask.html#configuration))
- The `params` are urlencoded to ensure that all the parameters passed in the URL are correctly formatted and can be safely transmitted
- Redirect the user to the constructed logout URL which logs them out. After that, the provider will redirect them back to the callback URL.

---

### Key Takeaways of Using Authlib

- Authlib simplifies the integration of OAuth and OpenID Connect.
    - It provides a robust and flexible framework for handling authentication and authorization flows in Flask applications.
- Properly managing OAuth tokens and user sessions is crucial for maintaining secure and efficient authentication mechanisms.
- The logout process is designed to ensure users are fully signed out, improving security and user experience.

Notes:
Points that are not included in the slides while might be helpful to consider in real life:
- Implement [refresh token](https://auth0.com/docs/secure/tokens/refresh-tokens/use-refresh-tokens) handling to maintain long-lived sessions without re-authentication.
- User experience can be enhanced with custom login/logout pages and improved error handling.

---

# Questions?

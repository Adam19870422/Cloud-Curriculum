# Authentication & Authorization

<!-- TrackingCookie-->
{% with pagename="auth-python" %}
    {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

## 🎯 Learning Objectives

In this module, you will learn:

- How to log in using OpenID Connect.
- How to log out.
- How to protect a private API.

## 🧠 Theory

> When developing web applications, it is crucial to address common concerns such as preventing unauthenticated users from gaining access, implementing a seamless single sign-on experience, and controlling access to specific information within the application.

In this module, you will learn about the basics of authentication and authorization:

  - General Concepts: [slides](../slides/fundamentals){target=_blank} ([with speaker notes](../slides/fundamentals/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_e2bghiaw){target=_blank}
  - Python specific: [slides](../slides/python){target=_blank} ([with speaker notes](../slides/python/?showNotes=true){target=_blank})

!!! info "OAuth v.s. OpenID Connect (OIDC)"
    Are you curious about the distinction between OAuth and OpenID Connect (OIDC)? 🤔 It's common to hear these terms used interchangeably when discussing authentication and authorization.

    - **OAuth** provides mechanism to grant and manage access permissions (authorization). It enables applications to secure designated access to user data without sharing password details.
        - Initially, OAuth wasn't designed for authentication, but it has been widely adopted for this purpose in practice.
    - **OIDC** is developed to extend OAuth by providing a way to authenticate users and obtain their identity information in a secure and standardized manner.

## 💻 Exercise
In this exercise you will learn how to setup authentication and authorization for a simple service.

<!-- Prerequisites-->
{% with
  required=[
      '[Flask](https://flask.palletsprojects.com/en/3.0.x/){target=_blank}'
  ],
  beneficial=[
      '[Authlib](https://docs.authlib.org/en/latest/basic/index.html){target=_blank}'
  ]
%}
{% include 'snippets/prerequisites/python.md' %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="auth", folder_name="auth-python" %}
{% include 'snippets/clone-import/python.md' %}
{% endwith %}

{% with  folder_name="auth-python" %}
{% include 'snippets/python-create-use-virtual-env.md' %}
{% endwith %}

### 🔍 Code Introduction

Since the main focus of this exercise is to learn about authentication and authorization, we have included some code in the starting point:

- The `run.py` file initializes and runs the Flask application on port 8080.
- The `config.py` file sets up configuration variables for the application.
- In the `app` folder,
    - the `app.py` file sets up the Flask app and its routes, including pages like the homepage and a restricted admin area, as well as authentication flow routes such as login, logout and the OAuth callback.
    - the `oauth.py` file contains a `init_oauth()` function that initializes an OAuth client using the [Authlib](https://docs.authlib.org/en/latest/basic/index.html) library.
    - the `decorators.py` file contains custom decorators e.g. `is_admin` which checks if a user has admin privileges.
    - the `template` folder holds HTML templates used for rendering various views.

### 1 - Configure OAuth Client
#### 1.1 - Install Authlib

!!! info
    The [Authlib](https://docs.authlib.org/en/latest/basic/index.html) is a Python library that assists in implementing authentication and authorization related to OAuth and OpenID.

To add the dependency for that, you can include the following line in the `requirements.txt` file:

```
Authlib==1.3.1
```

{% include 'snippets/install-dependencies/python.md' %}

#### 1.2 - Export Client Credentials
!!! tips "Secure your secrets"
    Hardcoding client credentials in your project is a risky practice, even for non-production environments. We'd like to avoid such practices to safeguard against potential data breaches.

In the `config.py` file, we retrieve credentials from environment variables.

Let's set the values for the `SAP_CLIENT_ID` and `SAP_CLIENT_SECRET`.

=== "Unix/MacOS/Git Bash on Windows"
    ```sh
    export SAP_CLIENT_ID=2a30e426-b564-4313-a4a3-e3e4d6c88050
    export SAP_CLIENT_SECRET=g/CmJZ?8gTD-7PSuG/lYs_8Uq:jT=Jy
    ```
=== "Powershell on Windows"
    ```sh
    $env:SAP_CLIENT_ID="2a30e426-b564-4313-a4a3-e3e4d6c88050"
    $env:SAP_CLIENT_SECRET="g/CmJZ?8gTD-7PSuG/lYs_8Uq:jT=Jy"
    ```

#### 1.3 - Add Configuration for OAuth/OpenIdConnect
Implement the `init_oauth()` function in the `oauth.py`.

1. Initialize an [OAuth](https://docs.authlib.org/en/latest/client/api.html#authlib.integrations.flask_client.OAuth) object.
1. Use `oauth.register()` to register to an OAuth provider, specifying information like:

&nbsp;|usage|value
-|-|-
name|a unique identifier for the OAuth provider|`'sap'`
server_metadata_url|URL to retrieve the provider's metadata|concatenation of the OAuth provider's base URL (defined in the `config.py`) and `/.well-known/openid-configuration`
client_kwargs|extra parameters for the OAuth client e.g. setting the scope to `'openid'` to indicate the use of OpenID Connect for authentication|`{ 'scope': 'openid' }`

??? info "Scope in OAuth"
    In OAuth, the `scope` defines the level of access, such as user data, profile details, email, and more, with the available options determined by the server.

    This approach helps limit the permissions allocated to the application, guaranteeing it accesses only the essential information and functionalities needed for its function.

Later in the exercise, we can access the OAuth client easily by `app.oauth.sap`.

??? example "Need help?"
    - To create an OAuth client, you can either directly initialize it with your application instance, or opt for a two-step process using the `init_app()` method.
        ```python linenums="1"
        from authlib.integrations.flask_client import OAuth

        """ Approach 1 """
        oauth = OAuth(app)

        """ Approach 2 """
        oauth = OAuth()
        # do something in between
        oauth.init_app(app)
        ```
    - Register the client by providing necessary information for establishing a connection with the provider.
        
        ```python linenums="1"
        base_url = app.config.get('your_defined_base_url') 

        oauth.register(
            name = 'custom',
            server_metadata_url = f'{base_url}/.well-known/openid-configuration',
            client_kwargs = {
                'scope': 'openid'
            }
        )
        ```

        The Authlib Flask OAuth registry automatically loads its configuration from the Flask `app.config`. This automation simplifies the process e.g. the OAuth client will automatically obtain the client credentials there.

#### 1.4 - Try the Application
1. Run the application with the command:

    ```sh
    python run.py
    ```

1. Go to [localhost:8080/home](http://localhost:8080/home){target=_blank}.

The app is straightforward. You'll see a welcome message with your username and roles. At the beginning, the user is treated as a guest without roles.

There are three main buttons:

- `Login` will start the login process,
- `Logout` will log you out,
- `Admin` takes you to a restricted Admin-only page.

### 2 - Implement the Login
Let's implement the login behavior in the `app.py` file.

#### 2.1 - Login Route
!!! info "Description"
    This route is responsible for starting the authentication process. It might initiate an OAuth flow with a third-party authentication provider or redirect the user to an identity provider's login page e.g. SAP IAS.

In the `app.py` file, there's an endpoint defined with route `/login`.

- When this route is accessed, currently it returns a response with status `Not implemented (501)`.

Implement the function `login` for initiating the login process that:

- handles the route `/login`
- generates a redirect URL pointing to another route `/callback`
    - ensure the URL is external by setting the `_external` parameter to `True`

    ??? example "Need help?"
        To build a URL, use the `url_for()` function. Its first parameter is the target endpoint name, usually the same name as the function handling the URL.

        ```python linenums="1"
            from flask import url_for

            @app.route('/callback')
            def callback():
                pass

            redirect_url = url_for('callback', _external=True)
        ```

        OAuth providers need a complete, navigable URL to securely redirect users back to the application after login. Enabling `_external` ensures the URL is fully formed, including the domain and schema, making it suitable for certain external use.

- redirects the user to the OAuth provider's authorization page using `app.oauth.sap.authorize_redirect(redirect_url)`
    
    !!! info
        - Use `app.oauth` to access the OAuth client instance that we configured in [Section 1](https://pages.github.tools.sap/cloud-curriculum/materials/all/auth/python/#1-configure-oauth-client).
            
            The `sap` attribute matches the `name` specified when registering with a particular OAuth provider (e.g. SAP IAS). In practice, it's feasible to connect with various providers, each identified by distinct names.

        - The method `authorize_redirect()` will initiate the OAuth flow by handling the redirection to the provider's authorization page.

#### 2.2 - Callback Route
!!! info "Description"
    The OAuth provider redirects the user to this route after the one has authenticated and granted permission to your application. This route is responsible for exchanging the authorization code for an access token and possibly retrieving user information. It marks the completion of the login flow.

Create a function `callback` for handling the callback from the OAuth provider that:

- handles the route `/callback`
- retrieves the authorization token sent by the OAuth provider using `app.oauth.sap.authorize_access_token()`
- uses `token['userinfo']` to get the user information
- saves the user information in the app session
- redirects the user to the homepage

??? example "Need help?"
    - To obtain the access token, use:

        ```python linenums="1"
        token = app.oauth.sap.authorize_access_token()
        ```

        The `token` can appear in different formats, such as a string (a pure access token) or a dictionary containing other information. In the exercise, look for user-related information within `token['userinfo']`.
    
    - Flask's `session` acts as a storage for each session, used like a dictionary for storing any data.
  
        ```python linenums="1"
        from flask import session

        session['user'] = token['userinfo']
        ```
    
    - To redirect a user to another endpoint, use the `redirect()` function.

        ```python linenums="1"
        from flask import redirect, url_for

        @app.route('/')
        def home():
            return 'Hello World!'

        @app.route('/redirect')
        def redirect():
            return redirect(url_for('home'))
        ```

#### 2.3 - Try out Login
1. Run the application with the command:

    ```sh
    python run.py
    ```

1. Go to [localhost:8080/home](http://localhost:8080/home){target=_blank}.
1. Click the `Login` button.
    - You will be redirected to the SAP IAS login page.
1. Log in with the credentials:
    - username: `regular`
    - password: `Pa$$word`

!!! success "Now you can log in successfully 🤩"

??? warning "Still failing? Check your client credentials "
    If your login process is interrupted with an error message such as "OpenID provider cannot process the request because the configuration is incorrect...", please check that you have correctly exported the `SAP_CLIENT_ID` and `SAP_CLIENT_SECRET` in the current terminal (see section 1.3).

### 3 - Implement the Logout
#### 3.1 - Try out Logout

Try click the `Logout` button.

!!! failure "You'll notice that the logout feature is not yet implemented."
    Additionally, if you navigate between different pages within the application, you'll find that you remain logged in.

#### 3.2 - Logout Route
In the `app.py` file, there's an endpoint defined with route `/logout`. 

- When this route is accessed, currently it returns a response with status `Not implemented (501)`.

Let's implement the logout behavior with the following logic.

1. Remove the user data from the session.

    ??? example "Need help?"
        This will effectively logout the user from the application.

        You can remove specific data by `session.pop(key_name, None)`. Or if you want to remove all data from the session, you can use `session.clear()`.

1. Generate a redirect URL to the homepage.
    - Make sure you set the `_external` to `True` which is necessary for redirecting back after logout.
1. Create a dictionary of parameters that will be passed to the OAuth logout URL. 

    &nbsp;|usage|value
    -|-|-
    client_id|a unique identifier for the OAuth provider to identify the client|use `app.config.get('...')` to get from the application config
    post_logout_redirect_uri|this will ask the SAP IAS to redirect users back to the home URL|the redirect URL generated in the last step

1. Use `urlencode()` from `urllib.parse` to encode the parameters.
1. Construct a logout URL via: 
    - retrieve the base url from `config.py`
    - append the logout path (`/oauth2/logout`)
    - along with the encoded parameters
1. Redirect the user to the logout URL.

??? example "Need help?"
    ```python linenums="1"
    from urllib.parse import urlencode
    from flask import url_for, session, redirect

    @app.route('/logout')
    def logout():
        session.pop('user', None)
        home_url = url_for('home', _external=True)
        
        client_id = app.config.get('your_defined_client_id')
        params = urlencode({
            'params1': 'value1',
            'params2': 'value2'
        })

        base_url = app.config.get('your_defined_base_url')    
        logout_url = f'{base_url}/oauth2/logout?{params}'
        return redirect(logout_url)
    ```

#### 3.3 - Try out Logout
1. Run the application with the command:

    ```sh
    python run.py
    ```

1. Go to [localhost:8080/home](http://localhost:8080/home){target=_blank}.
1. Log in with the credentials:
    - username: `regular`
    - password: `Pa$$word`
1. Click on the `Logout` button.
    - You will be redirected to the homepage with the user and role fields showing default values.

!!! success "Now you have logged out successfully 🤩"

### 4 - Secure the Admin page
When logged in, you may have found the user has a role `USER` displayed on the homepage.

There is another role `ADMIN`, which grants exclusive access to the restricted page in this exercise.

??? info "Role-Based Access Control (RBAC)"
    The [Role-Based Access Control (RBAC)](https://en.wikipedia.org/wiki/Role-based_access_control) is well-known for its managing permissions within systems. Besides RBAC, there are many other access control models designed to meet various security needs and organizational structures e.g. `Rule-Based Access Control`, which grants permissions based on a set of predefined rules; `Access Control Lists (ACLs)`, which specify detailed access rights for users or user groups to system resources; and others, each offering different mechanisms for securing resources and controlling access.

#### 4.1 - Try visit the `/restricted`
1. Log in with the credentials:
    - username: `regular`
    - password: `Pa$$word`
1. Go to [localhost:8080/home](http://localhost:8080/home){target=_blank}.
    - You can see the current user has a role `USER`.
1. Click the `Admin` button
    - You will be navigated to the restricted [Admin page](http://localhost:8080/restricted){target=_blank}.

!!! danger "You can visit it 😧"
    Although you can access the Admin page, this shouldn't be the case. The page is intended to be exclusive to admins only. Let's proceed to learn how to implement the access control for such sensitive pages.

#### 4.2 - Implement the `is_admin` Decorator
??? info "Decorators in Python"
    A decorator is a function that takes another function as an argument, wraps its behavior in an additional function, and returns this new function instead. Decorators allow you to extend the wrapped function's behavior without modifying it.

    Let's learn from the following example.

    - The `say_hello` is a decorator function which will prints a greeting message.
    - The `get_weather` is a simple function intended to print a message about the weather.
        - When it is decorated with `say_hello`, every call to `get_weather` will first go through the wrapper function defined in `say_hello`.

    ```python linenums="1"
    def say_hello(func):
        def wrapper(*args, **kwargs):
            sender = kwargs.get('sender', 'Anonymous')
            print(f'Hello, {sender}!')
            func()
        return wrapper

    @say_hello
    def get_weather(sender: str = None):
        print('Today is a sunny day :)')

    get_weather() # Hello, Anonymous! Today is a sunny day :)
    get_weather(sender='Alice') # Hello, Alice! Today is a sunny day :)
    ``` 

Implement the decorator `is_admin` in the `decorators.py` that:

- contains an inner wrapper function
- retrieves the user's information from the session
- checks if the user has the `ADMIN` role:
    - if so, return the original function
    - otherwise, display the `403.html` page using `render_template()`
    
    ??? example "Need help?"
        You can retrieve the user roles by accessing `session.get('user', {}).get('groups', [])`.
        
        - Here, the `groups` acts as a dictionary-like element within the previously stored user information.

In the `app.py` file, decorate the route `/restricted` with `is_admin`.

??? example "Need help?"
    Let's learn from the following example.

    The `login_required` decorator is a function designed to accept another function, `func`, as its parameter. This `func` corresponds to the Flask route you want to protect.

    ```python linenums="1"
    from functools import wraps
    from flask import session, redirect, url_for

    def login_required(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not session.get('user'):
                return redirect(url_for('login'))
            return func(*args, **kwargs)
        return wrapper
    ```

    The `@wraps` decorator from the `functools` module in Python is used to preserve the metadata of the original function being wrapped.
    
    The inner `wrapper` function performs a session check to determine if a user is logged in:

    - if the user is unauthenticated, then redirect to the login page using `redirect(url_for('login'))`,
    - otherwise, the `wrapper` proceeds to execute the original `func` with any arguments it received, allowing the user to access the protected route.

#### 4.3 - Try visit the "/restricted"
1. Revisit the [Admin page](http://localhost:8080/restricted){target=_blank}.

!!! success "You cannot access the page, instead you will see a 403 page which is expected."

1. Log out the current user.
1. Log in another user with the `ADMIN` role:
    - username: `privileged`
    - password: `Pa$$word2`
1. Try access the [Admin page](http://localhost:8080/restricted){target=_blank}.

!!! success "As an Admin, you can now enter the Admin page."

## 🙌 Congratulations! Submit your solution.

{% with path_name="python/auth", language="Pythonn", branch_name="auth-python" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}

## 🏁 Summary
Congratulations on completing this exercise!! 

You have now learnt how to set up a Flask application with OpenID Connect for user authentication, session management, and role-based access control.

{% include "snippets/rating-section.md" %}

## 🦄 Stretch Goals
You should already have a good understanding of the common parts by now, but if you want to challenge yourself further, consider implementing additional behaviors.

1. Although we have learned how to authenticate users, we can consider creating a separate profile page to display user profiles retrieved from the IDP. The code snippets below can be modified to achieve this.

    - Add a route `/profile` for the profile page in `app.py`.
    - Add an additional decorator `login_required` to protect the profile page.
    - Create a template `profile.html` in the `templates` directory.
    - Update the homepage template `index.html` to include a navigation to the profile page.

1. Include a "Remember Me" behavior which will keep users sessions longer.
    - Set the duration of remembrance.
    - Enhance logic in routes relevant for `/login` and `/callback`.

1. Provide feedback to users with flash messages when they log in or log out.
    - Enhance routes `/callback` and `/logout` with flash messages.

1. Handle errors that may occur during the OAuth flow.

## 📚 Recommended Reading
- [OAuth and OpenID Connect in Plain English (VIDEO)](https://www.youtube.com/watch?v=sSy5-3IkXHE){target=_blank}
- [Authlib: Flask OAuth Client](https://docs.authlib.org/en/latest/client/flask.html){target=_blank}
- [Python: functools Library](https://docs.python.org/3/library/functools.html){target=_blank}
- [SAP IAS Docs](https://help.sap.com/viewer/6d6d63354d1242d185ab4830fc04feb1/LATEST/en-US/d17a116432d24470930ebea41977a888.html)

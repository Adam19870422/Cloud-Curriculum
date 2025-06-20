# Authentication & Authorization in Java

---

## Spring Security


- Authentication & Authorization Framework within the Spring Ecosystem
- Has multiple sub projects to support different technologies e.g. Kerberos, OAuth, SAML, etc.

Notes:
- New version of spring security (5.x) was released in 2020, note that there were many changes compared to earlier versions. When googling you might come across tutorials or articles which work with previous versions that won't work anymore; Save yourself frustration by making sure which version you are looking at.

[Docs](https://docs.spring.io/spring-security/site/docs/current/reference/html5/)


---

### Security activated by default

- Convention over Configuration
- Application is secured by default as soon as Spring Security dependency is added

Notes:
- By default it will require all requests to be authenticated. It will output a random password to the console during application startup (the username is "user"). 

---

### Spring Security OAuth Client

- Is activated by providing the configuration for an OAuth client either via application properties or programmatically

```java
ClientRegistration oidcClientRegistration = ClientRegistrations
                    .fromIssuerLocation(
                            "https://aghtrtxzy.accounts400.ondemand.com")
                    .registrationId("sapias")
                    .clientName("SAPIAS")
                    .clientId("auth-exercise-app")
                    .clientSecret("71bb36f6-e15a-438c-9e03-b446747c28a6")
                    .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                    .scope("openid")
                    .build();

```

Notes:
- Just by adding/registering a registration (via a repository), Spring Security will start using it.

- `fromIssuerLocation`: Creates a ClientRegistrationBuilder which configures itself based on the meta-information-endpoint of the given URL
        The required URIs can be found on a `.well-known/openid-configuration` path.
            E.g. for our SAP IAS: [https://aghtrtxzy.accounts400.ondemand.com/.well-known/openid-configuration](https://aghtrtxzy.accounts400.ondemand.com/.well-known/openid-configuration).
- `clientId` and `clientSecret`: The OAuth clients credentials
- `clientName`: The internal name of the OAuth client
- `authorizationGrantType`: There are different types of OAuth Authorization grants, we are telling spring security to use the type "authorization_code"
- `scope`: The OAuth scopes we are requesting, note that these are not scopes in the sense of roles, but [scopes as defined by OAuth](https://oauth.net/2/scope/). In our case requesting the "openid" scope is sufficient.

---


### Customization of behavior

- typically done by extending `WebSecurityConfigurerAdapter`
- DSL to configure required behavior in the configure method

```java
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		
		http.oauth2Login().and()
        .oauth2Client().and()
        .authorizeRequests()
		    .antMatchers("/api/v1/publicEndpoint").permitAll()
		    .antMatchers("/api/v1/topSecret").hasRole("vip")
		    .anyRequest().authenticated();
	}

```

Notes:

-`configure(HttpSecurity http)`: The configure method gives us the opportunity to provide custom configuration
- `http.oauth2Login()` and `http.oauth2Client()`: Tell spring security that we want to use OAuth2 to log in our customers and that we want to use a configured OAuthClient to do so. We could provide further customization to those methods if we wanted, but the defaults are fine for now.
- matchers specify an URL path and define the required behavior or prerequisites for access e.g. user must have role
- The ant in antMatchers comes from the [Apache Ant](https://ant.apache.org/) build tool. The name only indicates that it matches in a similar fashion as the Ant tool did.
- wildcards are possible e.g. "/api/v1/*" matches any path that starts with /api/v1/
- ordering of matchers matters since matchers will try to match by order of registration -> more specific matchers must be defined before more generic ones


---

# Questions?

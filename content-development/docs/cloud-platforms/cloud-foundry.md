# Cloud Foundry Basics
<!-- TODO: remove the {{language}} since it's given by the new navigation -->

<!-- TrackingCookie-->
{% if language == "Java" %}
{% with pagename="cloud-foundry-java" %}
{% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}
{% elif language == "Node.js" %}
{% with pagename="cloud-foundry-nodejs" %}
{% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}
{% include 'snippets/node22-disclaimer.md' %}
{% else %}
{% with pagename="cloud-foundry-python" %}
{% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}
{% endif %}

## 🎯 Learning Objectives

In this module you will learn...

- how to push an application using the Cloud Foundry CLI.
- how to configure routes through the `manifest.yml` file.
- how to manipulate deployed applications.


## 🧠 Theory

>Platform as a service (PaaS) or application platform as a service (aPaaS) or platform-based service is a category of cloud computing services that provides a platform allowing customers to develop, run, and manage applications without the complexity of building and maintaining the infrastructure typically associated with developing and launching an app. (source: [Wikipedia](https://en.wikipedia.org/wiki/Platform_as_a_service){target=_blank})

In this module, you will learn about the basics of cloud platforms:

  - General concepts: [slides](../slides/fundamentals){target=_blank} ([with speaker notes](../slides/fundamentals/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_rfjpzboo){target=_blank}
  - Cloud Foundry: [slides](../slides/cloud-foundry){target=_blank} ([with speaker notes](../slides/cloud-foundry/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_cdwpt2gs){target=_blank}



## 💻 Exercise
In this exercise you will deploy an application to Cloud Foundry.

<!-- Prerequisites-->
{% if language == "Java" %}
{% with
  tools=[
    ('[**CF client V8**](https://github.com/cloudfoundry/cli/wiki/V8-CLI-Installation-Guide){target=_blank}'),
      ],
  required=[
    ('(Very) basic Java development skills')
  ]
%}
{% include 'snippets/prerequisites/java.md' %}
{% endwith %}
{% elif language == "Python" %}
{% with
  tools=[
      ('[**CF client V8**](https://github.com/cloudfoundry/cli/wiki/V8-CLI-Installation-Guide){target=blank}')
  ],
  beneficial=[
      ('[Pytest](https://docs.pytest.org/en/7.1.x/contents.html){target=_blank}')
  ]
%}
{% include 'snippets/prerequisites/python.md' %}
{% endwith %}
{% else %}
{% with
  tools=[
      ('[**CF client V8**](https://github.com/cloudfoundry/cli/wiki/V8-CLI-Installation-Guide){target=blank}')
  ],
  beneficial=[
      ('[Mocha](https://mochajs.org){target=blank}')
  ]
%}
{% include 'snippets/prerequisites/nodejs.md' %}
{% endwith %}

{% endif %}

### 🚀 Getting Started

{% if language == "Java" %}

{% with branch_name="cloud-platforms", folder_name="cloud-platforms-java-cf" %}
{% include 'snippets/clone-import/java.md' %}
{% endwith %}

{% elif language == "Node.js" %}

{% with branch_name="cloud-platforms-ts", folder_name="cloud-platforms-nodejs-cf" %}
{% include 'snippets/clone-import/nodejs.md' %}
{% endwith %}

{% include 'snippets/install-dependencies/nodejs.md' %}

{% elif language == "Python" %}

{% with branch_name="cloud-platforms", folder_name="cloud-platforms-python-cf" %}
{% include 'snippets/clone-import/python.md' %}
{% endwith %}

{% with folder_name="cloud-platforms-python-cf" %}
{% include 'snippets/python-create-use-virtual-env.md' %}
{% endwith %}

{% include 'snippets/install-dependencies/python.md' %}

{% endif %}

### 🔍 Code Introduction

We have a service that delivers a fortune cookie from a collection of quotes stored in a database. The goal of this exercise is to get it running on Cloud Foundry.

The important files are:

{% if language == "Java" %}

- `com.sap.cc.fortunecookies.FortuneCookieController`: the REST layer - responds with a fortune cookie at the root url
- `com.sap.cc.fortunecookies.FortuneCookieRepository`: class responsible for retrieving the quotes from the db
{% elif language == "Node.js" %}
- `src/lib/config.ts`: the configuration for the application
- `src/lib/connection-pool.ts`: the connection pool for accessing the database
- `src/lib/migrate.ts`: the [db-migrate](https://db-migrate.readthedocs.io/en/latest/){target=blank} script that runs before the application starts
- `src/lib/application.ts`: the [express](https://expressjs.com){target=blank} app that responds with a fortune cookie at the root url
- `src/lib/fortune-cookie-service.ts`: the service that retrieves a random fortune cookie quote from the db
- `src/index.ts`: the main entry point that wires up everything and starts the server
{% elif language == "Python" %}
- `migrations`: the [alembic](https://alembic.sqlalchemy.org/en/latest/){target=blank} which are applied on app startup
- `app/create_app.py`: the [Flask](https://flask.palletsprojects.com/en/3.0.x/){target=blank} app that responds with a fortune cookie quote at the root url
- `server.py`: application entrypoint
- `app/fortune_cookies/fortune-cookies_service.py`: the service that retrieves a random fortune cookie quote from the db
- `app/models/fortunes.py`: the [SQLAlchemy](https://www.sqlalchemy.org/) fortunes database model
- `app/config.py`: Config file to read the database connection string based on the environment
{% endif %}

The other folder and files are not important for now.



### 1 - Create Space, Log in and Create Service
We provide a trial space for you within our org, please follow the steps below to create it and log in.

1. **Log in** to the **eu12** landscape **before you do anything else**
    ```bash
    cf login -a https://api.cf.eu12.hana.ondemand.com
    ```
    This is required for your shadow-user to be created on the landscape.

    !!! warning "Having issues logging in? Does your password not work as expected?"

        Does your account have 2FA enabled? If yes, logging in to Cloud Foundry is only possible using the `--sso` parameter e.g. `cf login --sso`.

        If for some reason `--sso` does not work for you, please see instructions on how to use [Hard/Soft RSA Token with your password](https://wiki.one.int.sap/wiki/display/CPUAM/Usage+CF+CLI#UsageCFCLI-LogOntotheCloudFoundryEnvironmentUsingtheCloudFoundryCommandLineInterface) (you will have to append the T-OTP to the end of your password as described in the article)

1. Use this [page](https://cndj-cf-provisioning.cfapps.sap.hana.ondemand.com/cfprovisioning){target=_blank} to create your space
1. After successful space creation via the tool, switch to your space within the org
    ```bash
    cf target -o dev-learning-trial -s (your d/i-number)
    ```

1. As the creation of backing services takes a long time, please trigger the creation of a postgresql instance via the command
    ```shell
    cf create-service postgresql-db development fortune-cookies-db
    ```
    We will use this in one of the later steps.

### 2 - Look Around

Applications in Cloud Foundry are grouped into spaces and spaces are grouped into organizations.

#### 2.1 Organizations

Find out more about organizations using:

1. `#!shell cf orgs` to view all organizations you are a member of
1. `#!shell cf target` with the `-o` option to select an organization (well, sorry if you only have access to one org)
1. `#!shell cf org-users ...` to see all users of an org, grouped by org role

#### 2.2 Spaces

Find out more about spaces using:

1. `#!shell cf spaces` to view all spaces inside of your selected org
1. `#!shell cf target` with the `-s` option to select a space (well, sorry if you only have access to one space)
1. `#!shell cf space-users ...` to see all users of a space, grouped by space role

??? info "Creating a new space"
    Depending on your org role you can try to create another space using `#!shell cf create-space ...`.

!!! warning "Switch back before you continue"
    If you switched to (targeted) a different org and/or space, make sure you switch back before you continue. Use `#!shell cf target` to display your current target.

### 3 - Deployment

Deploy the app in your space. In Cloud Foundry terminology, the deployment is called _push_. To deploy your app,

{% if language == "Java" %}

1. build the jar file first:

    ```shell
    mvn package
    ```

1. push the app to your currently targeted Cloud Foundry space:

    ```shell
    cf push fortune-cookies -p target/fortune-cookies.jar --random-route --no-start
    ```
    We are preventing the app from starting (using `--no-start`), as we need to set an environment variable first.

1. set an environment variable so that the buildpack uses the correct jre version

    ```shell
    cf set-env fortune-cookies JBP_CONFIG_OPEN_JDK_JRE "{ jre: { version: 17.+ } }"
    ```

1. restage the application so that the buildpack picks up the new environment variable and starts the app

    ```shell
    cf restage fortune-cookies
    ```
{% elif language == "Node.js" %}

1. build `.js` files first:

    ```shell
    npm run build
    ```

1. push the app to your currently targeted Cloud Foundry space:

    ```shell
    cf push fortune-cookies --random-route
    ```

{% elif language == "Python" %}

1. Create a file called `Procfile` in the root of your project with the following content (this will be used by Cloud Foundry to start the app):
    ```yaml
    web: python3 server.py
    ```

1. push the app to your currently targeted Cloud Foundry space, specifying the buildpack:

    ```shell
    cf push fortune-cookies --random-route
    ```


{% endif %}

1. scratch your head why it failed - and then check the logs:

    ```shell
    cf logs fortune-cookies --recent
    ```

    !!! warning "Expected failure"

        The app failed to start. This is expected!

        **The app failed to start because the database service is not yet bound.**

        We will fix this in the [next step](#4-services).

{% if language == "Node.js" %}
??? info "My app does not work in CF"
    If your code works locally but not within your CF deployment, your local node.js version and the one that CF uses might differ.
    First of all check what node versions are supported by checking the latest release of the [node.js buildpack](https://github.com/cloudfoundry/nodejs-buildpack/releases){target=blank}.

    Ideally your code should get compiled by a node.js version that is newer than your local node.js version. Choose the respective version and specify it in your `package.json` like the following:

    ```json
    "engines": {
      "node": "^22",
      "npm": "^10"
    }
    ```
{% endif %}

??? info "Routes"
    You used the `--random-route` flag to make sure you get a URL that is not already reserved by another app in a different space. By default/if not specified explicitly, Cloud Foundry uses the app name as hostname/prefix, suffixed with the default domain.

    Especially for generic app names like `hello-world`, the chance is high that the URL is already taken and cannot be used by your app.

    There are more options on `#!shell cf push` that give you fine-grained control on the route, as well as `#!shell cf map-route` and `#!shell cf unmap-route` to (un-)map routes independent from the push operation.

### 4 - Services

As you could see in the logs, the app cannot connect to the database. The database is something that the application needs, but it's not part of the application itself. In Cloud Foundry terminology, such things are called "services". Another typical example could be a messaging service.


#### 4.1 DB Service

1. Check the marketplace for available services using the command:

    ```shell
    cf marketplace
    ```

1. Find the service called `postgresql-db` and the plan `development` in the output.

    You used this service and plan at the end of step '[1 - Create Space, Log in and Create Service](#1-create-space-log-in-and-create-service)', to create the database service.

1. As service creation can take a while, check if the instance you created is ready, by using the command:
    ```shell
    cf services
    ```
    This will show you all services in your space and their status

    !!! warning "The status of your `fortune-cookies-db` needs to be `create succeeded` before you can continue below"

#### 4.2 Bind Service

After having successfully created the database service instance, you need to provide the connection details to your application. In Cloud Foundry, this concept is called "binding". To bind your app to the service,

1. run command `#!shell cf bind-service ...` (you need to figure out the syntax)

    You should see a warning to restage the app, this is because binding the app to the service changes the environment, and most applications only read the environment at startup time

1. restage the app: `#!shell cf restage ...`

  {% if language == "Node.js" or language == "Python" %}
    You will still see the error, we will fix this in the next step.
  {% elif language == "Java" %}
    The application will now start successfully and you can find the URL from the console output
  {% endif %}

1. inspect the environment of your app: `#!shell cf env ...`

    You should see an environment variable `VCAP_SERVICES` which is now visible to your app, a JSON string containing db connection details.

{% if language == "Java" %}
1. open the app URL (shown under `routes:` in the CLI output) in the browser - it should display a fortune now

    !!! info "Find URL in console output"
        If pushing is successful, the URL should be printed in the console output.

        If you face trouble opening the URL in the browser, you probably need to explicitly prefix the URL with `https://`

??? info "Java CFEnv Library"
    [Java CFEnv](https://github.com/pivotal-cf/java-cfenv){target=_blank} is a library for easily accessing the environment variables such as VCAP_SERVICES when deploying an application to Cloud Foundry. This library is downloaded by java build pack during application staging.

{% else %}

    !!! info "Binding is not doing much"
        As you can see, binding just provides service details to the app via environment variables. Your app still needs to be "told" to use this information to connect to the db. You'll do this in the next step.

{% endif %}

??? info "Restage vs. restart"
    There's also a `#!shell cf restart ...` command. You may wonder what's the difference between `restart` and `restage`. It's explained nicely in [this Stack Overflow post](https://stackoverflow.com/questions/50475750/what-is-difference-between-restage-and-restart-in-pcf#:~:text=Restart%20your%20app%20to%20refresh,When%20to%20Restage%3A&text=The%20staging%20process%20has%20access,the%20contents%20of%20the%20droplet){target=_blank}.

{% if language == "Node.js" or language == "Python" %}
{% if language == "Node.js" %}

#### 4.3 Connect to DB

The app has now access to the database connection information. To establish the connection we need to read the environment variable `VCAP_SERVICES` and extract the connection details.

1. run `#!shell cf env` and check the output, you should find a `VCAP_SERVICES` env variable that contains the connection information

1. install the [cfenv](https://www.npmjs.com/package/cfenv){target=_blank} module that helps you parsing and accessing the `VCAP_SERVICES` env variable:

    ```shell
    npm install cfenv
    npm install -D @types/cfenv
    ```

1. create a file `vcap.json` at the root of project

    ```json
    {
        "application": {
            "port": 3000
        },
        "services": {
            "fortune-cookies-db": [{
                "name": "fortune-cookies-db",
                "credentials": {
                    "uri": "postgres://postgres:postgres@localhost:5432/postgres",
                    "sslcert": null,
                    "sslrootcert": null
                }
            }]
        }
    }
    ```

    This file holds the _default_ config for the [cfenv](https://www.npmjs.com/package/cfenv){target=_blank} module when running the app **locally** and the `VCAP_SERVICES` environment variable has not been set.

1. edit `src/lib/config.ts` and use the [cfenv](https://www.npmjs.com/package/cfenv){target=_blank} module to parse the `VCAP_SERVICES` environment variable and export the `app` and `postgres` config:

    ```typescript
    import cfenv from 'cfenv'

    const appEnv = cfenv.getAppEnv({
        vcapFile: 'vcap.json'
    })

    const { app: { port } } = appEnv

    const serviceCreds = appEnv.getServiceCreds('fortune-cookies-db')

    if (!serviceCreds) {
        throw new Error('Failed to read service credentials for "fortune-cookies-db"')
    }
    const { uri: connectionString, sslcert: cert, sslrootcert: ca } = serviceCreds

    export default {
        app: {
            port
        },
        postgres: {
            connectionString,
            ssl: (cert && ca) ? { cert, ca } : false
        }
    }

    ```

Now that you have retrieved the connection information for the database in the `config` object, it will be used to initialize the `connection-pool` and the underlying [pg](https://node-postgres.com){target=_blank} driver.

{% elif language == "Python" %}

#### 4.3 Connect to DB

The app has now access to the database connection information. To establish the connection we need to read the environment variable `VCAP_SERVICES` and extract the connection details.

1. run `#!shell cf env` and check the output, you should find a `VCAP_SERVICES` env variable that contains the connection information

1. edit `app/config.py` and update the content so the application reads from the `VCAP_SERVICES` if set:

    ```python
    import os
    import json

    def db_url():

        if "VCAP_SERVICES" in os.environ:
            vcap_json = os.environ['VCAP_SERVICES']
            vcap = json.loads(vcap_json)
            uri = vcap['postgresql-db'][0]['credentials']['uri']
            return uri.replace("postgres://", "postgresql://")

        return os.getenv("PG_CONNECTION_STRING", "postgresql://postgres:postgres@localhost:5432/postgres")

    ```
{% endif %}


#### 4.4 Push Updated App

Push your changes to Cloud Foundry and verify things are working by:

{% if language == "Node.js" %}
1. building`.js` files:

    ```shell
    npm run build
    ```
{% endif %}

1. pushing the app and checking it's successful (use `#!shell cf logs ... --recent` if not)

    ```shell
    cf push fortune-cookies --random-route
    ```

1. opening the app URL (shown under `routes:` in the CLI output) in the browser - it should display a fortune now

    !!! info "Find URL in console output"
        If pushing is successful, the URL should be printed in the console output.

        If you face trouble opening the URL in the browser, you probably need to explicitly prefix the URL with `https://`

{% endif %}

??? info "See more app details"
    To show more information on the deployed app like memory consumption and CPU utilization:

    ```shell
    cf app fortune-cookies
    ```



### 5 - Manifest

You can configure your application by only using the Cloud Foundry CLI and perhaps you prefer working with shell scripts. Cloud Foundry provides manifest files as an alternative to this.

When the command `#!shell cf push` is executed, the client looks for a file named `manifest.yml` in the current directory (some options prevent this). In it you can specify the configuration for your application.

1. Create a file named `manifest.yml` in the project root directory with the following content:

    {% if language == "Java" %}

	```YAML
	applications:
      - name: fortune-cookies
        memory: 800MB
        path: target/fortune-cookies.jar
        buildpacks:
          - https://github.com/cloudfoundry/java-buildpack.git
        env:
          # see https://github.tools.sap/cloud-curriculum/materials/blob/main/cloud-platforms/cloud-foundry/java-memory-allocation.md
          JBP_CONFIG_OPEN_JDK_JRE: '{ memory_calculator: { stack_threads: 200 },jre: { version: 17.+ } }'
          JBP_CONFIG_SPRING_AUTO_RECONFIGURATION '{enabled: false}'
          MALLOC_ARENA_MAX: 4
        services:
          - fortune-cookies-db
	```

    {% elif language == "Node.js" %}

	```YAML
	applications:
	  - name: fortune-cookies
	    memory: 80MB
	    command: npm start
	    buildpacks:
	      - https://github.com/cloudfoundry/nodejs-buildpack
	    services:
	      - fortune-cookies-db
	```

    {% elif language == "Python" %}

	```YAML
	applications:
	  - name: fortune-cookies
	    memory: 80MB
	    command: python3 server.py
	    buildpacks:
	      - https://github.com/cloudfoundry/python-buildpack
	    services:
	      - fortune-cookies-db
	```

    Since we specified the starting command in the `manifest.yml`, delete the conflicting `Procfile`.

    !!! info "Specifying the Buildpack"
        Before, you were able to push an application without specifying a buildpack.
        That works because Cloud Foundry can (or tries to) detect which buildpack should be used. However it is a good practice to specify it. To do so, you simply supply a URL to the buildpack's Git repository.

    {% endif %}

1. Run `#!shell cf push` to deploy your app again.

    You do not have to specify an application name in the command, as it can be read from the manifest.

{% include 'snippets/cf-cleanup.md' %}

## 🙌 Congratulations! Submit your solution.

{% if language == "Node.js" %}
{% with path_name="node/cf/cloud-platforms", language="Node.js", branch_name="cloud-platforms-ts" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}
{% endif %}

{% if language == "Java" %}
{% with path_name="java/cf/cloud-platforms", language="Java", branch_name="cloud-platforms" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}
{% endif %}

{% if language == "Python" %}
{% with path_name="python/cf/cloud-platforms", language="Python", branch_name="cloud-platforms" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}
{% endif %}

## 🏁 Summary

Good job!
In the prior exercises you pushed an application using the Cloud Foundry CLI, bound it to a backing service and connected to the database, and then you stored the deployment information in a `manifest.yml` to simplify the deployment.

## 🦄 Stretch Goals

You should already have a good idea of all common parts by now, you could stop here... oooor you can explore a little further:

- Deploy the other type of app (Java/Node.js) to find out how they differ. What happens when you have both running and map them to the same route?
- Map another route to your application using `#!shell cf map-route`. In what situations can this be useful?

## 📚 Recommended Reading

- [cf push](https://docs.cloudfoundry.org/devguide/push.html){target=_blank}
- [Configuring Routes and Domains](https://docs.cloudfoundry.org/devguide/deploy-apps/routes-domains.html){target=_blank}
- [Managing Service Instances](https://docs.cloudfoundry.org/devguide/services/managing-services.html){target=_blank}
{% if language == "Java" %}
- [Tips for Java developers](https://docs.cloudfoundry.org/buildpacks/java/java-tips.html){target=_blank}
- [Java memory allocation in CloudFoundry](https://github.tools.sap/cloud-curriculum/materials/blob/main/cloud-platforms/cloud-foundry/java-memory-allocation.md){target=_blank}
{% else %}
- [Tips for Node.js developers](https://docs.cloudfoundry.org/buildpacks/node/node-tips.html){target=_blank}
- [Node-Postgres SSL](https://node-postgres.com/features/ssl){target=_blank}
{% endif %}

## 🔗 Related Topics

- SAP's ["North Star Architecture"](https://jam4.sapjam.com/groups/mYaTDaPrTFfwSbtvLnKjox/documents/DSANxIsFKFCBsZUQeXwJdR/slide_viewer){target=_blank} provides guidance on when to choose which platform or setup.
- [North Star Architecture Amendment/Update](https://sap.sharepoint.com/teams/NorthStarArchitectureIntegrationKernelServices/Shared%20Documents/General/North%20Star%20Architecture%20Strategy%20Papers/2022/North_Star_Architecture_2022.pdf?cid=476bf941-53b3-4bfc-a6d0-e3455d12e0d3){target=_blank}
- SAP's [Cross Product Architecture's paper](https://jam4.sapjam.com/blogs/show/ox5i7h49WDfMZ2oMtxBiFG){target=_blank} on our go-to runtimes in [SAP BTP](https://account.int.sap.eu2.hana.ondemand.com/#/home/welcome){target=_blank}
- [SAP Kernel Services SampleApp & Tutorial](https://pages.github.tools.sap/KernelServices/adoption-guide/cf-sample-app){target=_blank}: has information and tutorials on the SAP Kernel Services for CF
- [User-provided services](https://docs.cloudfoundry.org/devguide/services/user-provided.html){target=_blank}: useful when you need a service that is not available in the Cloud Foundry marketplace.
{% if language == "Java" %}
- [Buildpacks](https://docs.cloudfoundry.org/buildpacks/){target=_blank}: more information on buildpack and buildpack-specific configuration options, e.g. to optimize the memory config for your Java app.
{% else %}
- [Buildpacks](https://docs.cloudfoundry.org/buildpacks/){target=_blank}: more information on buildpack and buildpack-specific configuration options, e.g. to optimize the memory config for your Node.js app.
{% endif %}
- [Managing Apps](https://docs.cloudfoundry.org/devguide/managing-apps-index.html){target=_blank}: advanced things like running one-off tasks, scaling apps and health checks.
- [Orgs, Spaces, Roles and Permissions](https://docs.cloudfoundry.org/concepts/roles.html){target=_blank}: Few more infos.
- You might want to have a look if [Kyma](https://jam4.sapjam.com/groups/QrsMLb8Me6YjlNkgcm5Ku4/overview_page/sRvzqbb8tAQUqdgBxkRrte){target=_blank} is a better fit for your specific use case

# Release Toggles (Cloud Foundry + Java)

<!-- TrackingCookie-->
{% with pagename="release-toggles-cf-java" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

{% with language="java", deployment="cloud-foundry" %}
  {% include "release-toggles/header.md" %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="release-toggles", folder_name="release-toggles-cf-java" %}
{% include 'snippets/clone-import/java.md' %}
{% endwith %}

1. Start the service's database first: `./start-db.sh` (keep the window open!)

1. Then, start the application:

    {% with main_class="BulletinboardAdsApplication" %}
    {% filter indent(4) %}
    {% include 'snippets/run-application/run-java.md' %}
    {% endfilter %}
    {% endwith %}

    You should be able to access the UI at [http://localhost:8080](http://localhost:8080){target=blank}

### 🔍 Code Introduction

The domain is a simple bulletinboard application. You can post something there that you want to advertise, such as a used laptop, and others can look at all the offerings and contact you if they are interested.

The feature we would like to implement is "Order by Popularity" (the count of view visits). The advertisements will show in the order based on the number of views on the detail page of each one.

To do this, we will have to change and enhance multiple classes. Let's assume this feature is quite a bit of work, and therefore we are hiding it behind a toggle, so that we could theoretically always merge our code and even deploy it to production, even if the feature is not yet finished.

- `com.sap.bulletinboard.ads.models.Advertisement` holds all information related to an entity. We are going to add a new field for the popularity.
- `com.sap.bulletinboard.ads.models.AdvertisementRepository` is the persistence of the advertisements. We are going to enhance it, to order entities based on their popularity.
- `com.sap.bulletinboard.ads.controllers.AdvertisementController` is the HTTP API endpoint. Here we are going to implement the "switch".

### 1 - Implement toggle service

In order to prevent the unfinished work from impacting existing functions, we can introduce a flag (toggle point) into our code and use if/else statement to control either old or new algorithm will be executed. Then a toggle service is needed to switch on/off the toggle point dynamically without re-deployment, and allow automation tests cover both code path during integration.

There are many ways to implement a toggle service, varying from a simple in-memory store to a highly sophisticated backing system with a fancy UI. For now we'll start with a very simple implementation.

1. Open the project in your IDE.
1. Add a new file `com/sap/bulletinboard/ads/services/ToggleService.java` in the `src/main/java` folder.

    ```java
    @Service
    public class ToggleService {
        
        public boolean isEnabled(String featureName) {
            return Boolean.parseBoolean(System.getProperty(featureName));
        }
    }
    ```

Here we can use System properties to dynamically set a feature, and use toggle service to get the status of it. Later on, we will see how to implement a more sophisticated toggle service based on **feature-flags** in SAP BTP.

### 2 - Design tests

[Test-driven development](../test-driven-development/java.md){target=blank} (TDD) is a best practice in software development which helps us identify the requirements and achieve high quality products. Before implementing the feature by changing the production code, we design the test cases at first.

#### 2.1 - Regression tests

1. Open the file `com/sap/bulletinboard/ads/controllers/AdvertisementControllerTest.java` in the `src/test/java` folder.
1. Check the test cases in the file. 

The test cases are designed during previous development to cover existing functionality of the application. When we implement a new feature, those test cases can be considered as **regression tests** and we don't want to break them.

#### 2.2 - New functional tests

Notice that we have an existing test method `showAdsInChronologicalOrder`, which covers the old algorithm - advertisements will show in chronological order.

Now we want to add a new method for the feature "order by popularity".

1. Add a new variable in the file `AdvertisementControllerTest.java` to define the feature.

    ```java
    private static final String FEATURE_NAME = "order.popularity";
    ```

1. Add a new variable to mock the toggle service.

    ```java
    @MockBean
    private ToggleService toggleService;
    ```

1. Add another test method `showAdsByPopularity` to cover the new algorithm that:

    1. mocks the `toggleService` to enable the feature.

    1. creates two advertisements

    1. sends a GET request to the second advertisement to increase its popularity

    1. retrieves all advertisements and expects the second advertisement is placed at the first place
    
    ??? example "Need Help?"
        ```java
        @Test
        public void showAdsByPopularity() throws Exception {
            Mockito.when(toggleService.isEnabled(FEATURE_NAME)).thenReturn(true);

            String id1 = performPostAndGetId();
            String id2 = performPostAndGetId();

            mockMvc.perform(buildGetRequest(id2)).andExpect(status().isOk());

            mockMvc.perform(buildGetAllRequest()).andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id", is(Integer.parseInt(id2))))
                .andExpect(jsonPath("$[1].id", is(Integer.parseInt(id1))));
        }
        ```

#### 2.3 - Test execution

1. Trigger tests by running the command `mvn test`.
1. Check that the test method `showAdsByPopularity()` failed as we haven't implemented it yet. Other tests should pass.

### 3 - Implement order by popularity

To implement a feature to "order advertisements by popularity", we will change both persistence layer and controller layer.

#### 3.1 - Persistence layer

1. Open the file `com/sap/bulletinboard/ads/models/Advertisement.java` in the `src/main/java` folder.
1. Add a new variable to define the column `views` in the database table. We will store the number of views on each advertisement in this column.

    ```java
    @Column(name = "views")
    private Long views;
    ```

1. Generate getter and setter methods to the variable `views`.

#### 3.2 - Data transfer object

1. Open the file `com/sap/bulletinboard/ads/controllers/dto/AdvertisementDto.java` in the `src/main/java` folder.
1. Add a new variable to store the number of views in the DTO object.

    ```java
    public Long views = 0L;
    ```

1. Open the file `com/sap/bulletinboard/ads/controllers/AdvertisementController.java` in the `src/main/java` folder.
1. Find the method `entityToDto`, and add a new line before `return`.

    ```java
    dto.views = ad.getViews();
    ```

1. Find the method `dtoToEntity`, and add a new line before `return`.

    ```java
    ad.setViews(dto.views);
    ```

#### 3.3 - Controller layer

1. In the `AdvertisementController.java`, declare a new variable about the feature name.

    ```java
    static final String FEATURE_NAME = "order.popularity";
    ```

1. Go to `AdvertisementControllerTest.java`. Remove the code where we declared `FEATURE_NAME` and import the value directly from the controller.

1. Back to the controller file `AdvertisementController.java`. Add a new variable for toggle service, and initiate it through the constructor.

    ```java
    private ToggleService toggleService;

    public AdvertisementController(AdvertisementRepository repository, ToggleService toggleService) {
        this.repository = repository;
        this.toggleService = toggleService;
    }
    ```

1. Find the method `advertisementsForPage` and notice the line below. Advertisement will show in the order based on the query result from database.

    ```java
    Page<Advertisement> page = repository.findAll(PageRequest.of(pageId, DEFAULT_PAGE_SIZE));
    ```

1. Comment out this line, and replace with the implementation below.

    ```java
    Page<Advertisement> page;
    if (toggleService.isEnabled(FEATURE_NAME)) {
        page = repository.findAll(PageRequest.of(pageId, DEFAULT_PAGE_SIZE, Sort.by(Direction.DESC, "views")));
    } else {
        page = repository.findAll(PageRequest.of(pageId, DEFAULT_PAGE_SIZE));
    }
    ```

1. Find the method `advertisementById` which will be called every time we navigate to the detail page of an advertisement. We increase the number of views here.
1. Replace the method `advertisementById` with the implementation below.

    ```java
    @GetMapping("/{id}")
    public AdvertisementDto advertisementById(@PathVariable("id") @Min(0) Long id) {
        throwIfNotExisting(id);

        AdvertisementDto advertisement = entityToDto(repository.findById(id).get());
        advertisement.views++;
        repository.save(dtoToEntity(advertisement));
        return advertisement;
    }
    ```

#### 3.4 - Test execution

1. Trigger tests by running the command `mvn test`.
1. Make sure all tests passed.

### 4 - Check results

1. Start the application with new feature being toggled on

    ```shell
    mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dorder.popularity=true"
    ```

1. Access the application at [http://localhost:8080](http://localhost:8080){target=blank}.
1. Create some advertisements, and view detail pages of them.
1. Check if advertisements are ordered by popularity (the number of views).

### 5 - Deploy to BTP

In this step, you can deploy your solution to BTP and use the [BTP Feature Flags Service](https://help.sap.com/viewer/2250efa12769480299a1acd282b615cf/Cloud/en-US/d485374a71a149a7ba96b7403985a1a6.html){target=blank} to use an advanced third-party service to manage the toggles.

#### 5.1 - Create & Bind Feature Flags Service

The toggle service is available by default in most landscapes and can be created with a pre-defined flag definition using the command line interface.

1. Create the file `toggles-config.json` in the root directory of your project.

1. Define a flag inside with:

    - an `id` that matches your feature id in _lowercase_
    - _not_ enable the flag for now
    
    !!! info "Reference"
        Refer to the [docs](https://help.sap.com/docs/feature-flags-service/sap-feature-flags-service/json-file-example){target=blank} or expand below hint.

    ??? example "Need Help?"
        Many of the fields are not mandatory, but some are - here is a minimal version that should work, otherwise check the error message in the command line:

        ```json
        {
            "flags": [{
                "id": "order.popularity",
                "description": "demo",
                "variationType": "BOOLEAN",
                "enabled": false
            }]
        }
        ```

1. To create the service, use the command below.

    ??? example "Need Help?"
        To create the service, use the command below.

        ```sh
        cf create-service feature-flags lite feature-toggles-bulletinboard-ads -c toggles-config.json
        ```

        The plan used here is `lite`. If this plan is not available, you can use `cf marketplace` to view the available plans.

1. Bind the application to the toggle service.
    
    Add below service entry to your `manifest.yml`. Make sure the name of the service matches to the instance name from your previous `cf create-service` command.

    ```yml
          - feature-toggles-bulletinboard-ads
    ```

#### 5.2 - Deploy Application

1. Create database service.

    ```sh
    cf create-service postgresql-db development postgres-bulletinboard-ads
    ```

    !!! info "The database creation may take some time, you can use `cf services` to check the status."

1. Build and push your app.

    ```sh
    mvn package
    cf push --random-route
    ```

1. Inspect the environment vars of your app.

    ```sh
    cf env bulletinboard-ads
    ```

_You should see entries with connection information to the feature flags service: uri, username and password._

#### 5.3 - Call Feature Flags Service

As we could see previously, the `Feature Flags` service is a remote service.

We will call from our own service with the APIs documented [here](https://api.sap.com/api/FeatureFlagsAPI/overview){target=blank}.

1. Adjust `ToggleService.java`. You can use [CfEnv](https://github.com/pivotal-cf/java-cfenv){target=blank}, which is already pre-configured in `pom.xml`, to read uri, username and password from the environment. You can use [RestTemplate](https://www.tutorialspoint.com/spring_boot/spring_boot_rest_template.htm){target=blank} to send the HTTP API call to the feature flags service.

    ??? example "Need Help?"
        The following snippet should help. Make sure the name for your lookup matches the instance name of your CF service. The `v1` API of the feature flags service will return `HTTP 200 OK` if the flag is enabled, and `HTTP 204 NO CONTENT` if it is disabled.

        ```java
        public boolean isEnabled(String featureName) {
            CfCredentials c = new CfEnv().findCredentialsByName("feature-toggles-bulletinboard-ads");
            RestTemplate client = new RestTemplateBuilder().rootUri(c.getUri())
                    .basicAuthentication(c.getUsername(), c.getPassword()).build();
            String path = "/api/v1/evaluate/" + featureName;
            return client.getForEntity(path, String.class).getStatusCode() == HttpStatus.OK;
        }
        ```

1. Package your application, push it again and inspect the result. As the flag is disabled, you should still see the old behavior.

    ```sh
    mvn package
    cf push --random-route
    ```

1. Edit `toggles-config.json` to enable the feature, and then update the CF feature flags service using `cf update-service ...`.

    ??? example "Need Help?"
        Change the `enabled` property in the json file accordingly:

        ```json
        ...
        "enabled": true
        ...
        ```

        Then run in terminal:

        ```sh
        cf update-service feature-toggles-bulletinboard-ads -c toggles-config.json
        ```

1. Reload your browser page and inspect the result.

_You should now see the new behavior - ads ordered by their popularity._

### 6 - Clean up 🧹

Using release toggles allows us to achieve Continuous Delivery by integrating unfinished changes without delay. However, as shown in the exercise, release toggles can introduce complexity to both the codebase and the system landscape. Therefore, it is essential to remove toggles once they have served their purpose.

1. Navigate to the file `AdvertisementController.java`.
1. Remove the toggle point, and change the `if/else` statement to only use the new algorithm.
1. Navigate to the file `AdvertisementControllerTest.java`.
1. Remove the toggle point, and remove the test case for the old algorithm.
1. Re-run tests to make sure nothing is broken.

### 7 - Reflection 🪞

You've come that far - good job. Probably noticed a few caveats that we haven't talked about. Let's reflect about it to become an even better cloud engineer!

??? question "What if the service is slow or unavailable? Right now we're making a synchronous call!"
    Imagine you have a feature which is deeper down in your business logic, like some 'calculateRebate' function, which is executed for 20 items on a single user request. You would be making 20 sync calls to a third-party service, which will make your solution slow or even fragile if the service is unavailable.

    Like with any third-party service that your're calling at runtime, it is a good practice to _decouple_, e.g. [using eventual consistency & async](https://pages.github.tools.sap/cloud-curriculum/boot-restart/challenges/decouple-services/){target=blank}.

??? question "How to develop locally? Right now `mvn spring-boot:run` will fail!"
    While in theory, you could also call the feature flags service from your local machine, it's not advisable for multiple reasons:
    - it will impact your development if you have network issues
    - since this is a central service not owned by you, you better check if there is a development or sandbox instance so that you're not creating load on a production service
    - you need to find a way to deal with the credentials

    It's therefore advisable, to better inject a testing service. A very simple and elegant way would be to define a bean that is used for local development. You can add this code to class `BulletinboardAdsApplication.java`

    ```java
        @Bean
        @Profile("dev")
        public ToggleService localToggleService(RestTemplateBuilder builder) {
            return new ToggleService() {
                public boolean isEnabled(String featureName) {
                    return true;
                }
            };
        }
    ```

??? question "How about the data base schema in production? Here we've added a new field!"
    In our case, we only added a new field, and it gets automatically added to the DB schema due to setting `spring.jpa.generate-ddl=true` we are using. In real applications, this is not advisable as you will lose transparency on schema changes in your production DB, and it also has several limitations.

    Migrating DBs in production without a downtime is a big topic on its own. Learn more about this in [Zero-Downtime DB Migrations](https://pages.github.tools.sap/cloud-curriculum/boot-restart/challenges/zero-downtime-db-migration/){target=blank}

??? question "Are there other release strategies? When we released, we changed _existing_ behavior!"
    In our case, it's probably arguable that the existing logic of ordering things randomly, is generally not very helpful, so the users might be happy about our change anyway. However, changing existing behavior is always a delicate thing.

    An alternative release strategies could have been to add this really like a new functionality, including a new HTTP API endpoint, or introducing an optional `orderBy` URL parameter. This way, you wouldn't even have needed a release toggle anymore_. On the UI, you could then just have a button `Order by Popularity` which will add this URL parameter. If needed, only this button could have been hidden during development using a much more lightweight UI-only feature toggle.

??? question "Shouldn't release decisions be documented? Now we just enabled it using a CLI command!"
    You may have noticed that we just executed a command from the CLI to enable the feature. We could as well have used some dashboard / UI of the feature toggle service to enable it. Both approaches have the problem that it is not a very controlled way. Who is allowed to do this? Are the changes logged?

    You may have noticed that our toggle configuration file was already part of the code base. You can take that one step further: don't allow _any_ people to change the toggle state in the production system, no matter if through a command line interface, or through an admin UI. Instead, make the toggle state part of the code base, so that changes become part of the version history, and make sure the state is applied during your pipeline execution. This principle is called _Infrastructure as Code_.

## 🙌 Congratulations! Submit your solution.

{% with path_name="java/cf/release-toggles", language="Java", language_independent = false, branch_name="release-toggles" %}
{% include 'snippets/self-learner/commit-push-exercise-independent.md' %}
{% endwith %}

## 🏁 Summary

Good job!

In this module, you have learned how to apply the concept of Release Toggles in a real world scenario. You produced a well tested feature and deployed the application to BTP. You also understood the trade-offs and considerations before you implement Release Toggles in your own project.


## 📚 Recommended Reading

- [Martin Fowler Bliki: Feature Flag](https://martinfowler.com/bliki/FeatureFlag.html){target=blank} (basic)
- [Article from Pete Hodgson on Fowler's pages](https://martinfowler.com/articles/feature-toggles.html){target=blank} (more details)
- [Product Standard SLC-36 - Switchable Features](https://wiki.one.int.sap/wiki/display/pssl/SLC-36){target=blank}
- [SAP BTP Feature Flags Service](https://help.sap.com/docs/feature-flags-service){target=blank}
- [Feature-driven development process in Deploy with Confidence (DwC)](https://pages.github.tools.sap/deploy-with-confidence/solar-system/explanations/feature-toggle-lifecycle){target=blank}
- [Sirius: Software Delivery Management Tool to Track Corporate Requirements & Product Standards](https://wiki.one.int.sap/wiki/display/DevFw/Documentation%253A+Sirius){target=blank}
- [A/B Testing](https://usabilitygeek.com/a-b-testing-the-words-in-your-product/){target=blank}

## 🔗 Related Topics

- [DevOps & Cloud Native: Concepts 101](https://performancemanager5.successfactors.eu/sf/learning?destUrl=https%3A%2F%2Fsap%2eplateau%2ecom%2Flearning%2Fuser%2Fdeeplink%5fredirect%2ejsp%3FlinkId%3DITEM%5fDETAILS%26componentID%3DDEV%5f00002183%5fWBT%26componentTypeID%3DCOURSE%26revisionDate%3D1669283981000%26fromSF%3DY&company=SAP){target=_blank}
- Continuous Delivery
    - [Cloud Foundry & Java](https://pages.github.tools.sap/cloud-curriculum/materials/all/continuous-delivery/azure-cloud-foundry-java/){target=_blank} | [Cloud Foundry & Node.js](https://pages.github.tools.sap/cloud-curriculum/materials/all/continuous-delivery/azure-cloud-foundry-nodejs/){target=_blank}
    - [Kubernetes & Java](https://pages.github.tools.sap/cloud-curriculum/materials/all/continuous-delivery/azure-kubernetes-java/){target=_blank} | [Kubernetes & Node.js](https://pages.github.tools.sap/cloud-curriculum/materials/all/continuous-delivery/azure-kubernetes-nodejs/){target=_blank}
# Release Toggles (Kubernetes + Java)

<!-- TrackingCookie-->
{% with pagename="release-toggles-k8s-java" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

{% with language="java", deployment="kubernetes" %}
  {% include "release-toggles/header.md" %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="release-toggles", folder_name="release-toggles-k8s-java" %}
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

1. Access the application at [http://localhost:8080](http://localhost:8080){target=_blank}.
1. Create some advertisements, and view detail pages of them.
1. Check if advertisements are ordered by popularity (the number of views).

### 5 - Deploy to Kubernetes

There are several third-party tools that you can use to manage toggles in Kubernetes such as [LaunchDarkly](https://launchdarkly.com/){target=_blank}, [Split.io](https://www.split.io/){target=_blank} or [Unleash](https://www.getunleash.io/){target=_blank}. 

To keep the exercise simple, you are going to implement feature toggles by a native Kubernetes function [Downward API](https://kubernetes.io/docs/concepts/workloads/pods/downward-api/){target=blank}. The _downward API_ can expose container information about itself for your application inside that container to consume. You can externalize Kubernetes _labels_ or _annotations_ and mount them as a volume to the container. Once you modify the _labels_ or _annotations_, the changes will be populated automatically into the volume. You application can consume the data in the volume during runtime and act accordingly.

#### 5.1 - Mount downward API to the container

You can mount Kubernetes labels _metadata.labels_ in the the file `/etc/podinfo/labels`.

1. Find the `Deployment` section in the file `.k8s/2_bulletinboard-ads.yaml`. Add a new volume using _downward API_ and mount it to the container.

    ??? example "Need Help?"

        ```yaml
        apiVersion: apps/v1
        kind: Deployment
        ...
        spec:
          template:
            spec:
              containers:
                - name: app
                  ...
                  volumeMounts:
                    - name: podinfo
                      mountPath: /etc/podinfo
            volumes:
              - name: podinfo
                downwardAPI:
                  items:
                    - path: "labels"
                      fieldRef:
                        fieldPath: metadata.labels
        ```

#### 5.2 - Call Feature Flags Service

The Pod labels are stored in the file `/etc/podinfo/labels` with the format`key="value"` so your application can consume it.

1. Adjust `ToggleService.java`. Determine the status of feature flags from the property in the file `/etc/podinfo/labels`.

    ??? example "Need Help?"
        You can read the property directly from the file system.

        ```java
        public boolean isEnabled(String featureName) {
            Properties prop = new Properties();
            try {
                prop.load(new FileInputStream("/etc/podinfo/labels"));
            } catch (Exception e) {
                e.printStackTrace();
                return false;
            }
            String value = prop.getProperty(featureName, "FALSE").replaceAll("\"", "");
            
            return Boolean.parseBoolean(value);
        }
        ```

#### 5.3 - Build and push the docker image

We provide a docker image registry at `cc-ms-k8s-training.common.repositories.cloud.sap`, which you can use to store your docker images for this exercise. A registry is needed, because the Kubernetes cluster cannot (and should not) pull images from your machine. To prevent overriding images pushed by other participants, we ask you to put your D/C/I number into the image name in the following instructions.

1. Notice the `Dockerfile` in the root directory of the project. Build the docker image with the following command:

    ```shell
    docker build --platform linux/amd64 -t cc-ms-k8s-training.common.repositories.cloud.sap/bulletinboard-ads-<your D/C/I number>:v1 .
    ```

    !!! warning "Insert your D/C/I number, Apple Silicon, and the build path"
        1. Replace `<your D/C/I number>` with your real D/C/I number in the above command.
        All letters in a tag must be lowercase!
        1. Don't forget the `.` at the end of the command - this tells docker to build the image based on the `Dockerfile` in the current folder. You can also specify a `Dockerfile` with a different name or in other directories [using the `-f` option](https://docs.docker.com/engine/reference/commandline/build/#file){target=_blank}
        1. The option `--platform linux/amd64` is required on Macs with Apple Silicon to make sure the image works on the remote `linux/amd64`-based Kubernetes nodes. The option is redundant for regular, `amd64` based architectures.

1. Log in to the Docker repository with following command:

    ```shell
    docker login -u "claude" -p "your password" cc-ms-k8s-training.common.repositories.cloud.sap
    ```

1. Push the built image to the registry with the following command (with your D/C/I number inserted):

    ```shell
    docker push cc-ms-k8s-training.common.repositories.cloud.sap/bulletinboard-ads-<your D/C/I number>:v1
    ```

#### 5.4 - Deploy the application

We provide Kubernetes deployment YAML files for both database and application. You can find them in the `.k8s` directory.

1. Deploy the Database to Kubernetes with the following command:

    ```shell
    kubectl apply -f .k8s/1_bulletinboard-ads-db.yaml
    ```

1. Modify the file `2_bulletinboard-ads.yaml` and replace `image` with the one you build from last step, for example: `cc-ms-k8s-training.common.repositories.cloud.sap/bulletinboard-ads-<your D/C/I number>:v1`. 

1. Replace `<SUBDOMAIN>` in the `Ingress` section with the value from the [Infrastructure](#infrastructure) step. Note there are two places for `<SUBDOMAIN>`.

1. Deploy the application to kubernetes with the following command:

    ```shell
    kubectl apply -f .k8s/2_bulletinboard-ads.yaml
    ```

1. Check the deployment status by `kubectl get pod,deployment,service,ingress`

Navigate to the url `https://bulletinboard-ads.<SUBDOMAIN>.kyma.ondemand.com` (replace `<SUBDOMAIN>`) and you will see the application is running. Create some advertisements and view details of them.

_You should now see the old behavior - ads are NOT ordered by their popularity._

#### 5.5 - Toggle the flag

You can change the behavior by applying labels to your Pod.

1. Add a new label `order.popularity=true` to the Pod

    ??? example "Need Help?"
        As there are several Pods running in Kubernetes, you should at first find your Pod name with `kubectl get pods`, then add the label by the command:

        ```shell
        kubectl label pod <your_bulletinboard-ads_pod> order.popularity=true
        ```

Navigate to the url `https://bulletinboard-ads.<SUBDOMAIN>.kyma.ondemand.com `(replace `<SUBDOMAIN>`).

_You should now see the new behavior - ads are ordered by their popularity._

If you want to toggle off the new feature, simply update the label by the command:

```shell
kubectl label pod <your_bulletinboard-ads_pod> order.popularity=false --overwrite
```

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

{% with path_name="java/k8s/release-toggles", language="Java", language_independent = false, branch_name="release-toggles" %}
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

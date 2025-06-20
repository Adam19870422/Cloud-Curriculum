# Release Toggles (Kubernetes + Node.js)

<!-- TrackingCookie-->
{% with pagename="release-toggles-k8s-nodjs" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

{% with language="nodejs", deployment="kubernetes" %}
  {% include "release-toggles/header.md" %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="release-toggles", folder_name="release-toggles-k8s-nodejs" %}
{% include 'snippets/clone-import/nodejs.md' %}
{% endwith %}

1. Start the service's database first: `./start-db.sh` (keep the window open!)

1. Then, start the application:

    1. Install the dependencies

        ```shell
        npm install
        ```

    1. Stop and restart the app with the following command (if not running `npm run watch` already)

        ```shell
        npm start
        ```

    You should be able to access the UI at [http://localhost:8080](http://localhost:8080){target=blank}


### 🔍 Code Introduction

The domain is a simple bulletinboard application. You can post something there that you want to advertise, such as a used laptop, and others can look at all the offerings and contact you if they are interested.

The feature we would like to implement is "Order by Popularity" (the count of view visits). The advertisements will show in the order based on the number of views on the detail page of each one.

To do this, we will have to change and enhance multiple classes. Let's assume this feature is quite a bit of work, and therefore we are hiding it behind a toggle, so that we could theoretically always merge our code and even deploy it to production, even if the feature is not yet finished.

- `src/lib/storage/postgres-ad-storage.ts` is the persistence of the advertisements. We are going to enhance it, to order entities by their popularity.
- `src/lib/router/ad-router.ts` is the HTTP API endpoint. Here we are going to implement the "switch".

### 1 - Implement toggle service

In order to prevent the unfinished work from impacting existing functions, we can introduce a flag (toggle point) into our code and use if/else statement to control whether the old or new algorithm will be executed. Then a toggle service is needed to switch on/off the toggle point dynamically without re-deployment, and allow automation tests cover both code path during integration.

There are many ways to implement a toggle service, varying from a simple in-memory store to a highly sophisticated backing system with a fancy UI. For now we'll start with a very simple implementation.

1. Open the project in your IDE.
1. Add a new file `src/lib/toggle-service.ts`.

    ```typescript
    export class ToggleService {
        isEnabled(featureName: string) {
            return Boolean(process.env[featureName])
        }
    }
    ```

1. Export the feature (we will need later) as constant `export const ORDER_FEATURE = "ORDER_BY_POPULARITY"`

Here we can use environment variables to dynamically set a feature, and use `ToggleService` to get the toggle's status. Later on, we will see how to implement a more sophisticated toggle service based on **feature-flags** in SAP BTP.

### 2 - Design tests

[Test-driven development](../test-driven-development/nodejs.md){target=blank} (TDD) is a best practice in software development which helps us identify the requirements and achieve high quality products. Before implementing the feature by changing the production code, we design the test cases at first.

#### 2.1 - Regression tests

1. Open the file `test/router/ad-router.test.ts`.
1. Check the test cases in the file. 

The test cases are designed during previous development to cover existing functionality of the application. When we implement a new feature, those test cases can be considered as **regression tests** and we don't want to break them.

#### 2.2 - New functional tests

Notice that we have an existing test method `should order ads chronologically by creation date`, which covers the old algorithm - advertisements will show in chronological order.

Now we want to add a new method for the feature "order by popularity". We are working in file `test/router/ad-router.test.ts`.

1.  Import the `ORDER_FEATURE` and `ToggleService`.

    ```typescript
    import { ORDER_FEATURE, ToggleService } from '../../src/lib/toggle-service'
    ```

1. Add a new variable to mock the toggle service, instantiate the stub within the `beforeEach` test hook.

    Pass the variable as the 2nd argument to the `application` function. That way we can make it accessible for `ad-router`.

    ```typescript
    describe('ad-router', () => {
        // ...
        let toggleService: SinonStubbedInstance<ToggleService>
        //
        beforeEach(async () => {
            // ...
            toggleService = sinon.createStubInstance(ToggleService)
            // ...
            const app = application(storage, toggleService, loggerStub)
        })
    })
    ```

1. Add another test `should order ads chronologically by popularity` to cover the new algorithm that:

    1. mocks the `toggleService` to enable the feature.

    1. creates two advertisements

    1. sends a GET request to the second advertisement to increase its popularity

    1. retrieves all advertisements and expects the second advertisement is placed at the first place
    
    ??? example "Need Help?"
        ```typescript
        it('should order ads chronologically by popularity', async () => {
            toggleService.isEnabled.withArgs(ORDER_FEATURE).returns(true)
            const id1 = await storage.create(WOLLY_SOCKS)
            const id2 = await storage.create(USED_SHOES)
            await client.get(`/api/v1/ads/${id2}`).expect(200)

            const { body } =
                await client
                .get('/api/v1/ads')
                .expect(200)
                .expect('Content-Type', /application\/json/)

            assert.deepEqual(body.map((ad: Ad) => ad.id), [id2, id1])
        })
        ```

#### 2.3 - Test execution

Wait! Is your code compiling?

Probably not. Let's make it work first. To do so:

1. Update the `application` function in `src/lib/application.ts`. It should accept the `ToggleService` as its 2nd argument.

1. Now, we need to fix `test/application.test.ts` by updating the test setup. (We basically need to do the same steps we did for the `ad-router.test.ts`).

1. Update `src/main.ts` - it is enough to pass in a new `ToggleService` instance as the 2nd argument to the `application` function.

1. Don't forget to import the `ToggleService` in every file.

Now we can run the tests.

1. Trigger tests by running the command `npm test`.

1. Check that the test `should order ads chronologically by popularity` failed as we haven't implemented the corresponding logic yet. All the other tests should pass.

### 3 - Implement order by popularity

To implement a feature to "order by popularity", we will change both router layer and persistence layer, using an outside-in approach.

#### 3.1 - Router layer

1. Go to `src/lib/router/ad-router.ts`.

1. Import `ToggleService` and `ORDER_FEATURE` from `'../../src/lib/toggle-service'`.

1. In the GET-ALL handler, use the `toggleService` to check whether feature `ORDER_FEATURE` is active:

    - if the feature is active, call the (not-yet-existing) `storage.readAllByPopularity()` method
    - else, call the `storage.readAllByCreationDate()` method instead

    ```typescript
    router.get('/', async (req, res, next) => {
        try {
            let ads: Ad[] = []
            if (toggleService.isEnabled(ORDER_FEATURE)) {
                ads = await storage.readAllByPopularity()
            } else {
                ads = await storage.readAllByCreationDate()
            }
            res.status(200).json(ads)
        } catch (error) {
            next(error)
        }
    })
    ```

1. The `toggleService` is not yet defined.

    Add it as the 2nd argument in the `default export` function and ensure it is passed down from `src/lib/application.ts`.

1. Make sure it's also passed in all required tests.

#### 3.2 - (Persistence) Prepare the database schema and the queries

Now, we will take care of the persistence layer.

To do so, go to the `src/lib/storage/postgres-ad-storage.ts`. With the original `readAll` method, ads are ordered by creation date. 

1. Rename the method from `readAll` to `readAllByCreationDate` throughout the codebase.

1. Rename the corresponding SQL statement to `READ_ALL_BY_CREATION_DATE`.

1. Create a new statement `READ_ALL_BY_POPULARITY` (you can refer to `READ_ALL_BY_CREATION_DATE`).

    The new statement should return the ads, ordered by view count in descending order.
    
    To realize this, we will introduce a new column `viewCount`, which does not exist yet.

    ??? example "Need Help?"

        ```typescript
        static READ_ALL_BY_POPULARITY = 'SELECT id, title, contact, price, currency FROM ads ORDER BY "viewCount" DESC'
        ```

1. Create the method `readAllByPopularity`. You can use `readAllByCreationDate` as blueprint - make sure it uses the `READ_ALL_BY_POPULARITY` SQL statement.

1. Add the `"viewCount"` column to the database:
    1. Run `npm run db:migrate:create add-view-count` to create a migration file inside the `migrations` folder.
    1. Find the file and replace its content with the following `up`, and `down`

        ```typescript
        exports.up = async function (db) {
            await db.runSql('ALTER TABLE "ads" ADD COLUMN "viewCount" INT DEFAULT 0');
        };

        exports.down = async function (db) {
            await db.runSql('ALTER TABLE "ads" DROP COLUMN "viewCount"');
        };
        ```

#### 3.3 - (Persistence) Update view counts

!!! warning "Tests are still failing..."
    Run `npm test`. You will find tests are still failing because we have not implemented logic to update the `viewCount` when someone visits an ad.

Go to the `src/lib/storage/postgres-ad-storage.ts`.

1. Add a new SQL statement `INCREASE_VIEW_COUNT` to increment the `viewCount` of a given ad.

    ??? example "Need Help?"

        ```typescript
          static INCREASE_VIEW_COUNT = 'UPDATE ads SET "viewCount" = "viewCount" + 1 WHERE id = $1'
        ```

1. Create a method `increaseViewCount(id: number)` which calls the statement with a given ad.

    ??? example "Need Help?"

        ```typescript
        async increaseViewCount(id: number) {
            try {
                this.logger.debug('Increasing view count for ad with id: %s', id)
                await this.pool.query(PostgresAdStorage.INCREASE_VIEW_COUNT, [id])
                this.logger.debug('Successfully increased view count for ad with id: %s', id)
            } catch (error) {
                const { message } = error as Error
                this.logger.error('Error increasing view count for ad with id: %s - %s', id, message)
                throw error
            }
        }
        ```

#### 3.4 - Wrap everything together

Go to the `src/lib/router/ad-router.ts`.

In the GET `/:id` handler, add logic to call the `storage.increaseViewCount` method after an ad is received successfully.

??? example "Need Help?"

    ```typescript
    router.get('/:id', validateAndParseId(), async (req, res, next) => {
        try {
            const { params: { id } } = req
            const ad = await storage.read(id)
            await storage.increaseViewCount(id)
            res
                .status(200)
                .json(ad)
        } catch (error) {
            next(error)
        }
    })
    ```

!!! tip "Ideally, we will not `await` the `increaseViewCount` method."
    This is clearly a task which could run asynchronously in the background. This is done here to keep a simple test setup.

#### 3.5 - Test execution

Run tests by `npm test`.

!!! success "All the tests should now pass."

### 4 - Try your solution

1. Start the application with new feature being toggled on

    ```shell
    ORDER_BY_POPULARITY=true npm start
    ```

1. Access the application at [http://localhost:8080](http://localhost:8080){target=blank}.
1. Create some advertisements, and visit their detail pages.
1. Check if advertisements are ordered by popularity (the count of view visits).

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

The Pod labels are stored in the file `/etc/podinfo/labels` with the format`key="value"` so your application can consume it. For this, we have to rework the `ToggleService` in `src/lib/toggle-service.ts`.

1. Change the `isEnabled` method to be `async`

1. Adjust the GET ALL handler in `src/lib/router/ad-router.ts` and the test in `test/router/ad-router.test.ts`

    ```typescript
    router.get('/', async (req, res, next) => {
        try {
            // ..
            if (await toggleService.isEnabled(ORDER_FEATURE)) {
            // ..
        } catch (error) {
            next(error)
        }
    })
    ```

    ```typescript
    it('should order ads chronologically by popularity', async () => {
      toggleService.isEnabled.withArgs(ORDER_FEATURE).resolves(true)
      // ..
    )
    ```

1. Adjust `src/lib/toggle-service.ts`. Determine the status of feature flags from the property in the file `/etc/podinfo/labels`.

    ??? example "Need Help?"
        You can read the property directly from the file system.

        ```typescript
        import fs from 'node:fs/promises'

        export class ToggleService {
            async isEnabled(featureName: string) {
                const content = await fs.readFile("/etc/podinfo/labels", "utf-8")
                const labels = this.parseLabels(content)
                console.log({ labels })
                return labels.get(featureName) || false
            }

            private parseLabels(content: string): Map<string, boolean> {
                return content.split("\n").reduce((map: Map<string, boolean>, line) => {
                const [key, value] = line.split("=")
                const isSet = value.replace(/"/g, "") === "true"
                map.set(key, isSet)
                return map
                }, new Map())
            }
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
    kubectl apply -f .k8s/1_bulletinboard-ads-db.yml
    ```

1. Modify the file `2_bulletinboard-ads.yml` and replace `image` with the one you build from last step, for example: `cc-ms-k8s-training.common.repositories.cloud.sap/bulletinboard-ads-<your D/C/I number>:v1`. 

1. Replace `<SUBDOMAIN>` in the `APIRule` section with the value from the [Infrastructure](#infrastructure) step.

1. Deploy the application to kubernetes with the following command:

    ```shell
    kubectl apply -f .k8s/2_bulletinboard-ads.yml
    ```

1. Check the deployment status by `kubectl get pod,deployment,service,ingress`

Navigate to the url `https://bulletinboard-ads.<SUBDOMAIN>.kyma.ondemand.com` (replace `<SUBDOMAIN>`) and you will see the application is running. Create some advertisements and view details of them.

_You should now see the old behavior - ads are NOT ordered by their popularity._

#### 5.5 - Toggle the flag

You can change the behavior by applying labels to your Pod.

1. Add a new label `ORDER_BY_POPULARITY=true` to the Pod

    ??? example "Need Help?"
        As there are several Pods running in Kubernetes, you should at first find your Pod name with `kubectl get pods`, then add the label by the command:

        ```shell
        kubectl label pod <your_bulletinboard-ads_pod> ORDER_BY_POPULARITY=true
        ```

Navigate to the url `https://ads.<SUBDOMAIN>.kyma.ondemand.com `(replace `<SUBDOMAIN>`).

_You should now see the new behavior - ads are ordered by their popularity._

If you want to toggle off the new feature, simply update the label by the command:

```shell
kubectl label pod <your_bulletinboard-ads_pod> ORDER_BY_POPULARITY=false --overwrite
```

### 6 - Clean up 🧹

Using release toggles allows us to achieve Continuous Delivery by integrating unfinished changes without delay. However, as shown in the exercise, release toggles can introduce complexity to both the codebase and the system landscape. Therefore, it is essential to remove toggles once they have served their purpose.

1. Navigate to the file `src/lib/router/ad-router.ts`.
1. In the GET ALL handler: Remove all toggle-related code, and change the `if/else` statement to only use the new algorithm.
1. Navigate to the file `test/router/ad-router.test.ts`.
1. Remove all toggle related code, and remove the test case for the old algorithm (order by creation date).
1. Re-run tests to make sure nothing is broken.

### 7 - Reflection 🪞

You've come that far - good job. Probably noticed a few caveats that we haven't talked about. Let's reflect about it to become an even better cloud engineer!

??? question "What if the service is slow or unavailable? Right now we're making a synchronous call!"
    Imagine you have a feature which is deeper down in your business logic, like some 'calculateRebate' function, which is executed for 20 items on a single user request. You would be making 20 sync calls to a third-party service, which will make your solution slow or even fragile if the service is unavailable.

    Like with any third-party service that your're calling at runtime, it is a good practice to _decouple_, e.g. [using eventual consistency & async](https://pages.github.tools.sap/cloud-curriculum/boot-restart/challenges/decouple-services/){target=blank}.

??? question "How to develop locally? Running the application locally will fail"
    The service is dependent on the file `/etc/podinfo/labels` existing and having the correct content and format.
    It's therefore advisable, to better inject a testing service. An elegant way would be to define an `interface` for the `ToggleService` that can be injected and to provide a "local" implementation.

    ```typescript
        export class LocalToggleService extends ToggleServiceInterface{
            async isEnabled(featureName: string) {
                return true
            }
        }
    ```

    Alternatively, you can pass in the path to the file to read from inside the `ToggleService` and add a local file for testing purposes.

??? question "How about the data base schema in production? Here we've added a new field!"
    Migrating DBs in production without a downtime is a big topic on its own. Learn more about this in [Zero-Downtime DB Migrations](https://pages.github.tools.sap/cloud-curriculum/boot-restart/challenges/zero-downtime-db-migration/){target=blank}

??? question "Are there other release strategies? When we released, we changed _existing_ behavior!"
    In our case, it's probably arguable that the existing logic of ordering things randomly, is generally not very helpful, so the users might be happy about our change anyway. However, changing existing behavior is always a delicate thing.

    An alternative release strategies could have been to add this really like a new functionality, including a new HTTP API endpoint, or introducing an optional `orderBy` URL parameter. This way, you wouldn't even have needed a release toggle anymore_. On the UI, you could then just have a button `Order by Popularity` which will add this URL parameter. If needed, only this button could have been hidden during development using a much more lightweight UI-only feature toggle.

??? question "Shouldn't release decisions be documented? Now we just enabled it using a CLI command!"
    You may have noticed that we just executed a command from the CLI to enable the feature. We could as well have used some dashboard / UI of the feature toggle service to enable it. Both approaches have the problem that it is not a very controlled way. Who is allowed to do this? Are the changes logged?

    You may have noticed that our toggle configuration file was already part of the code base. You can take that one step further: don't allow _any_ people to change the toggle state in the production system, no matter if through a command line interface, or through an admin UI. Instead, make the toggle state part of the code base, so that changes become part of the version history, and make sure the state is applied during your pipeline execution. This principle is called _Infrastructure as Code_.

<!-- ## 🙌 Congratulations! Submit your solution.

{% with path_name="nodejs/k8s/release-toggles", language="Node.js", language_independent = false, branch_name="release-toggles" %}
{% include 'snippets/self-learner/commit-push-exercise-independent.md' %}
{% endwith %} -->

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
    - [Cloud Foundry & Node.js](https://pages.github.tools.sap/cloud-curriculum/materials/all/continuous-delivery/azure-cloud-foundry-nodejs/){target=_blank} | [Cloud Foundry & Node.js](https://pages.github.tools.sap/cloud-curriculum/materials/all/continuous-delivery/azure-cloud-foundry-nodejs/){target=_blank}
    - [Kubernetes & Node.js](https://pages.github.tools.sap/cloud-curriculum/materials/all/continuous-delivery/azure-kubernetes-nodejs/){target=_blank} | [Kubernetes & Node.js](https://pages.github.tools.sap/cloud-curriculum/materials/all/continuous-delivery/azure-kubernetes-nodejs/){target=_blank}
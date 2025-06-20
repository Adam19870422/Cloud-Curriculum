
You have completed the exercise!

If you signed-up for your [Cloud Native Developer Journey](https://sap.sharepoint.com/sites/126802/SitePages/Cloud-Native-Developer-Journey.aspx){target=_blank}, it's now time to push your code. This is a mandatory step, so we can update your progress and check the results.

{% if language == "Java" and not language_independent %}

1. Run the tests 🧪 to verify your implementation: `mvn clean verify`
{% endif %}

{% if language == "Node.js" and not language_independent and not branch_name == "cloud-platforms-ts" %}
1. Run **all** the tests 🧪 to verify your implementations: `npm run test`
{% endif %}

1. Commit your code. Get the local branch name by executing the command `git branch` and use in the place of `<local branch>` in the below command

1. Execute the following command to push your code to a **remote branch** (in a special repo) that matches your `C/D/I-Number` (e.g. d055151 or i234212)
(SAP NETWORK/VPN ONLY).

    ```bash
    git push https://gitproxy.internal.cfapps.sap.hana.ondemand.com/{{ path_name }} <local branch>:<your D/I/C userId>
    ```

    !!! warning "Analytics Data Collection and Removal"
        Analytics data, including your C/D/I-Number and the validation workflow outcome, is stored when a solution is submitted.  
        If you wish to have this data removed, you can do so through the learner app or by sending an email to [cloud-native@sap.com](mailto:cloud-native@sap.com?subject=Request to remove analytics data).
    
    !!! hint "Git Errors"
        In case of any `Git` related error please have a look at our [**Git FAQ**](../../faq/git){target=_blank}

{% if language == "Node.js" and branch_name != "genai-tooling" %}
    !!! warning "Updates were rejected because the remote contains work that you do not have locally."
        If you have submitted the exercise in JavaScript before, your push might be rejected. To fix this you can forcefully push your solution by appending `-f` to the push command. 

{% endif %}


{% if language != "Python" %}
1. After you have pushed your code, we will run automatic smoke tests on your solution. The status of the exercise in your ["Learner Steps list"](https://cloud-native-developer-journey.cfapps.eu12.hana.ondemand.com/){target=_blank} should automatically change to either "Passed" or "Failed" within 30 minutes, depending on the results of the smoke tests.
{% endif %}


You have completed the exercise!

You may push your results now. We will be grateful for this, as it allows us to see if people are able to successfully complete the exercise, and see if and where we need to improve it. Later on, a validation workflow will be added which will give you feedback on the successful completion of the exercise.

{% if language == "Java" and not language_independent %}
1. Run the tests 🧪 to verify your implementation: `mvn clean verify`
{% endif %}

{% if language == "Node.js" and not language_independent %}
1. Run **all** the tests 🧪 to verify your implementations: `npm run test`
{% endif %}

{% if language_independent %}
1. Clone your forked repository and change into the directory

    ```bash
    git clone <your forked repo URL> cd-hyperspace-azure
    cd cd-hyperspace-azure
    ```
{% else %}
1. Commit your code. 
{% endif %}


1. Execute the command below in the command line to push your code to a **remote branch** in our submission repo that matches your `C/D/I-Number` (e.g. d055151 or i234212)
(SAP NETWORK/VPN ONLY).

    ```bash
    git push https://gitproxy.internal.cfapps.sap.hana.ondemand.com/{{ path_name }} {{ branch_name }}:<your D/I/C userId>
    ```
    !!! hint "Git Errors"
        In case of any `Git` related error please have a look at our [**Git FAQ**](../../faq/git){target=_blank}

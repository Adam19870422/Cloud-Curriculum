
{% if language == "Java" %}
1. Run the tests 🧪 to verify your implementation: `mvn clean verify`
{% endif %}

{% if language == "Node.js" %}
1. Run **all** the tests 🧪 to verify your implementations: `npm run test`
{% endif %}

1. Commit your changes (Hint: Make sure to add all the modified files to staging area before commiting).
2. Push your changes to a **remote branch** that matches your `C/D/I-Number` (e.g. d055151 or i234212):

    ```bash
    git push origin {{ branch_name }}:<your D/I/C userId>
    ```

    !!! hint "Git Errors"
        In case of any `Git` related error please have a look at our [**Git FAQ**](../../faq/git){target=_blank}
{% if language == "Node.js" %}
    !!! warning "Updates were rejected because the remote contains work that you do not have locally."
        If you have submitted the exercise in JavaScript before, your push might be rejected. To fix this you can forcefully push your solution by appending `-f` to the push command. 

{% endif %}


1. In a terminal run the following command to clone the repository:
    ```bash
    git clone --branch {{ branch_name }} https://github.tools.sap/cloud-curriculum/exercise-code-nodejs.git {{ folder_name }}
    ```

{% with branch_name=branch_name, folder_name=folder_name %}
{% include 'snippets/github-credentials.md' %}
{% endwith %}

1. Open the folder `{{ folder_name}}` in your IDE.

1. In a terminal run the following command to clone the repository:
    ```bash
    git clone --branch {{ branch_name }} https://github.tools.sap/cloud-curriculum/exercise-code-java.git {{ folder_name }}
    ```

{% with branch_name=branch_name, folder_name=folder_name %}
{% include 'snippets/github-credentials.md' %}
{% endwith %}

1. Import the project into your IDE:

    === "IntelliJ"
        1. From the main menu, choose `File > Open...` .
        1. Navigate to the folder where you checked out the project (**{{ folder_name }}**) and click `OK`

    === "Spring Tool Suite"
        1. Go to `File > Import...` 
        1. select `Maven > Existing Maven Projects` and click `Next`.
        1. click `Browse`
        1. navigate to the folder where you checked out the project (**{{ folder_name }}**) and click `Open`
        1. click `Finish`

    === "Visual Studio Code"
        1. From the main menu, choose `File > Open Folder...` .
        1. Navigate to the folder where you checked out the project (**{{ folder_name }}**) and click `Open`

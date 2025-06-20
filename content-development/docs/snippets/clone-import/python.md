1. In a terminal run the following command to clone the repository:
    ```bash
    git clone --branch {{ branch_name }} https://github.tools.sap/cloud-curriculum/exercise-code-python.git {{ folder_name }}
    ```

{% with branch_name=branch_name, folder_name=folder_name %}
{% include 'snippets/github-credentials.md' %}
{% endwith %}

1. Import the project into your IDE:

    === "Visual Studio Code"
        1. Go to your Explorer panel
        2. Right-click and select `Add Folder to Workspace...`
        3. Navigate to the folder where you checked out the project (**{{ folder_name }}**) and click `Add`
    === "PyCharm"
        1. Go to `File` > `Open`
        2. Select your project folder and click `OK` to import the project
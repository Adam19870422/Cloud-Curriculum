    !!! tip "Tools Github Credentials"
        You may be asked for credentials.
        If you have not created a personal access token yet, you can get a token quickly [here](https://tokentool-tools-gh.cfapps.eu10.hana.ondemand.com/){target=_blank}.
        After logging in to github with your SAP-Credentials you will receive a token which you can use as a password for github.

    ??? tip "Write access to repository not granted"
        You may encounter access rights issues.
        If you are unable to clone your repository or push changes to it, and you see an error message like "Write access to repository not granted", try including your personal access token (PAT) in your clone or push command.
        ```bash
        git clone --branch {{ branch_name }} https://<PAT>@github.tools.sap/cloud-curriculum/exercise-code-java.git {{ folder_name }}
        ```
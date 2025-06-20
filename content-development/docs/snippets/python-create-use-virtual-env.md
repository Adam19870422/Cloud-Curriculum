1. Create and use virtual environments:
    1. Go to `{{ folder_name }}` in your terminal
    1. Run the following command to create a new virtual environment in a local folder named `.venv`:

        === "Unix/macOS"
            ```shell
            python3 -m venv .venv
            ```
        === "Windows"
            ```shell
            py -m venv .venv
            ```

    1. Then activate the virtual environment.

        === "Unix/macOS"
            ```shell
            source .venv/bin/activate
            ```
        === "Windows"
            ```
            .venv\Scripts\activate
            ```

        !!! tip "Quit the Virtual Environment"
            Run the command `deactivate` to quit the virtual environment.
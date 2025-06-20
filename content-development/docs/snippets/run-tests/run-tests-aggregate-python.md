1. Run the tests:

    === "Command Line"
        ```shell
        pytest
        ```
    === "Visual Studio Code"
        - From the Test Explorer (icon) run all discovered tests by selecting the play button (icon). If no test is showing, you can run the discovery with `Test: Refresh Tests` from the Command Palette (Ctrl + Shift + P)
        - From the Command Palette (Ctrl + Shift + P), by running any of the following commands:
            - `Test: Run All Tests` - Runs all tests that have been discovered.
            - `Test: Run Tests in Current File` - Runs all tests in a file that that is open in the editor.
            - `Test: Run Test at Cursor` - Runs only the test method under your cursor in the editor.
    === "PyCharm"
        - Right-click on the test folder, and click `Run 'pytest in <test folder>'`
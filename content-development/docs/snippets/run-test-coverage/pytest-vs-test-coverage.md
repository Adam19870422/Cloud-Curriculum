- Go to the `settings.json` file inside `.vscode` folder, and paste in the following settings:
```json
{
    "python.testing.pytestArgs": [
        "--cov=unit_testing",
        "--cov-report=html",
        "tests"
    ],
    "python.coveragepy.file": "coverage.py",
    "python.testing.unittestEnabled": false,
    "python.testing.pytestEnabled": true
}
```
- A `coverage` folder with an `index.html` file, containing the coverage results, should be present at the root of your project after each test run.
- Note that including a coverage report in VSCode with pytest-cov will conflict with the Debug mode of pytest. For more info see https://code.visualstudio.com/docs/python/testing#_pytest-configuration-settings.

- Check out the `Coverage Gutters` plugin if you would like to visualize the coverage inside your code.

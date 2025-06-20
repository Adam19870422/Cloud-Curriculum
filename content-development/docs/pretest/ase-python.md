# ASE Prerequisite Test for Python

<!-- TrackingCookie-->
{% with pagename="prerequisite-test-python" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-ase.md' %}
{% endwith %}

## 🧰 Technical Prerequisites

You will need a few things in order to do the pretest.

The bare minimum is:

- [**Git** client](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git){target=_blank}

- {% include 'snippets/python-install.md' %}

- **IDE** of your choice

    We recommend [Visual Studio Code](https://code.visualstudio.com/){target=_blank} with 

      - [Python Extension for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=ms-python.python){target=_blank}
      - [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig){target=_blank}

    extensions installed for the best developer experience throughout the exercise.
  

## 💻 Exercise

{% include 'snippets/copilot-pretest-warning.md' %}

### What do I need to do here?

For this prerequisite test you have to implement a `Developer` and a `Hackathon` class.

To do so, please follow the detailed steps below.

### 1. Clone Repository & Import

{% with branch_name="ase-pretest", folder_name="ase-pretest-python" %}
{% include 'snippets/clone-import/python.md' %}
{% endwith %}

!!! hint "Git Errors"

    In case of any `Git` related error please have a look at our [**Git FAQ**](../../faq/git){target=_blank}

{% with branch_name="unit-testing", folder_name="ase-pretest-python" %}
{% include 'snippets/python-create-use-virtual-env.md' %}
{% endwith %}

{% include 'snippets/install-dependencies/python.md' %}

🚨 **Do not rename or move the files in this project** 🚨

### 2. Create the DeveloperInterface ABC

1. Implement an abstract base class named `DeveloperInterface` in `app/developer_interface.py` with the following contract:
    - Two getter methods `get_name()` and `get_language()` that return a `str`.
    - The respective setter methods `set_name(name: str)` and `set_language(language: str)`.
    - A method called `code()`, which should return a `str`.


### 3. Implement the Developer Class

1. Define a public `Developer` class in `app/developer.py`.

1. Add the private attributes `_name` and `_language` of type `str`.

1. Create an `__init__` method which takes `name` (`str`) and `language` (`str`) as arguments, to initialize the class.

1. Make `Developer` implement the abstract base class `DeveloperInterface` you created earlier.
    
    Implement all necessary methods, but leave the `code()` method empty for now.

1. Create a method called `_load_language_print_map`, which
    - reads key/value pairs of `Language,Print Syntax` from a CSV file called `language_specific_print_syntax.csv`
    - stores them in a map (which we will use when implementing the `code` method below)

1. Call `_load_language_print_map` during class initialization inside the `__init__` method

1. Implement the `code()` method as an **asynchronous method**
    - Look up the `Print Syntax` for the given `language` in the map you initialized with `_load_language_print_map`
    - Replace the word "World" in the `Print Syntax` with the value of the `name` field e.g.:
        - `_name`: `Nicole`, `_language`: `nodejs`
          > `return "console.log('Hello, Nicole!')"`

        - `_name`: `John`, `_language`: `java`
          > `return "System.out.println('Hello, John!')"`

    - For any `language` not present in the map, the method should raise a `ValueError` with the message `Unsupported language: [language]` e.g.
      > `Unsupported language: abap`


1. Run the tests 🧪 to verify your implementation: `pytest tests/test_developer.py`

### 4. Implement the Hackathon Class

1. Define a public `Hackathon` class in the same file `app/hackathon.py`.

1. Add an instance variable `developers` of type `list[DeveloperInterface]`.

1. Create a method named `__init__` that takes an arbitrary list of `DeveloperInterface` instances as an argument and initializes the `developers` instance variable.

1. Implement an **asynchronous** public `run()` method that
    - **asynchronously** invokes the `code()` method on each `DeveloperInterface` in the `developers` list
    - separates the results of the invocations with a newline (\n). The final output should **NOT** have a trailing newline. e.g.

        >console.log("Hello, Nicole!") <br>
        System.out.println("Hello, John!") <br>
        print("Hello, Pete!")

    - catches any exceptions (e.g., for an unsupported language) that `code()` throws, and includes their error message in the output, e.g.

        >console.log("Hello, Nicole!") <br>
        System.out.println("Hello, John!") <br>
        Unsupported language: abap <br>
        print("Hello, Pete!")

1. Run the tests 🧪 to verify your implementation: `pytest`

### 5. Commit and Push your Solution


{% with path_name="python/ase", language="python", branch_name="ase-pretest" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}


### 6. Check Results

After pushing to this repository as per the previous step, a build that takes a few minutes to finish will be triggered.

You will be informed via mail whether you have passed ✅ or failed ❌. In case of a failure, the mail will provide some details about the errors. Don't worry: You have as many attempts as you need!


## 📣 Questions/Feedback

We value your feedback and your questions, and please use the teams channel [Learner Support: Cloud Native Developer Journey](https://teams.microsoft.com/l/team/19%3a0637dnZuwlGuuRXIm95UmDW1-DxvfNDqi4cLdYkA2Ho1%40thread.tacv2/conversations?groupId=6968a57a-9594-40de-b91c-d6b197057d01&tenantId=42f7676c-f455-423c-82f6-dc2d99791af7){target=_blank} to let us know!

💻 **Happy Coding** 💻

# ASE Prerequisite Test for Go

<!-- TrackingCookie-->
<!-- {% with pagename="prerequisite-test-nodejs" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-ase.md' %}
{% endwith %} -->

## 🧰 Technical Prerequisites

You will need a few things in order to do the pretest.

The bare minimum is:

- [**Git** client](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git){target=_blank}

- [*Go* Language installed](https://go.dev/dl/){target=_blank}

- **IDE** of your choice

    We recommend [Visual Studio Code](https://code.visualstudio.com/){target=_blank} with

      - [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig){target=_blank} and
      - [Go Extension](https://marketplace.visualstudio.com/items?itemName=golang.Go){target=_blank}

    extensions installed for the best developer experience throughout the exercises.

## 💻 Exercise


{% include 'snippets/copilot-pretest-warning.md' %}

### What do I need to do here?

For this prerequisite test you have to implement a `Developer` and a `Hackathon` function.

To do so please follow the detailed steps below.

### 1. Clone Repository & Import

1. Clone the following repository to your local machine (SAP NETWORK/VPN ONLY):
``` bash
git clone -b ase-pretest https://gitproxy.internal.cfapps.sap.hana.ondemand.com/go/ase ase-pretest-go
```

    !!! warning "Use the url for the clone command as it is"
        Opening it in the browser will only get you a 404

    !!! hint "Git Errors"

        In case of any `Git` related error please have a look at our [**Git FAQ**](../../faq/git)

1. Open it in your preferred IDE

1. Install the development dependencies

🚨 **Do not rename or move the files in this project** 🚨

### 2. Create the DeveloperInterface

1. Implement an Interface named `DeveloperInterface` in `developer/developer.go`, with the following contract:
    - Two getter methods `Name()`, and `Language()` that return a `string`
    - The respective setter methods `SetName(name string)` and `SetLanguage(language string)` without return value
    - A method called `Code()`, which returns a `(*string, error)` tuple

### 3. Implement Developer

1. Define a `Developer` struct in the same file (`developer/developer.go`).

1. Add the unexported fields `name` and `language` of type `string`

1. Create a function named `NewDeveloper` that
    - takes `name` (`string`) and `language` (`string`) as arguments
    - and returns a pointer to a new `Developer` instance.

1. Have `Developer` fulfill the `DeveloperInterface`

    Implement all necessary methods, the `Code()` method will be implemented in the next step.

1. Implement the `Code()` method.
    - For the languages listed in the example below, the returned `string` is based on the `name` and `language` attributes of the `Developer` instance (with `error` being `nil`). The `language` decides in which programming language syntax the code should be constructed. And the `name` of the developer should be injected into the greeting `Hello, [name]!`.

        - `name`: `Nicole`, `language`: `nodejs`
          >`console.log("Hello, Nicole!")`

        - `name`: `John`, `language`: `java`
          >`System.out.println("Hello, John!")`

        - `name`: `Pete`, `language`: `python`
          > `print("Hello, Pete!")`

        - `name`: `Greg`, `language`: `go`
          > `fmt.Print("Hello, Greg!")`

    - For any other *other* `language`, e.g. `abap`, `swift`, `rust` etc. return,
        - `nil` in the `string`
        - an `error` with the message `Unsupported language: [language]` (use `fmt.Errorf(...)` to construct the error) e.g.:
        > `Unsupported language: abap`


1. Run the tests 🧪 to verify your implementation: `go test ./developer`

### 4. Implement the hackathon function

1. Define a function `Hackathon` in `hackathon/hackathon.go`, that
    - accepts an arbitrary number of `struct`s that implement the `DeveloperInterface` as argument and returns a `string`.
    - invokes the `Code()` method on each `DeveloperInterface` (from the argument)
    - concatenates the results of the invocations separated by a newline (`\n`). The final output should **NOT** have a trailing newline e.g.
      >console.log("Hello, Nicole!") <br>
      System.out.println("Hello, John!") <br>
      print("Hello, Pete!")
    - appends the `error`'s message if `error` has a non-`nil` value (e.g., for an unsupported language) e.g. 
      >console.log("Hello, Nicole!") <br>
      System.out.println("Hello, John!")` <br>
      Unsupported language: abap <br>
      print("Hello, Pete!")

1. Run the tests 🧪 to verify your implementation: `go test ./hackathon`

### 5. Commit and Push your Solution

1. Run **all** the tests 🧪 to verify your implementations: `go test ./...`

1. Commit your changes (Hint: Make sure to add all the modified files to staging area before committing).
2. Push your changes to a **remote branch** that matches your `C/D/I-Number` (e.g. d055151 or i234212):

    ```bash
    git push https://gitproxy.internal.cfapps.sap.hana.ondemand.com/go/ase <local branch>:<your D/I/C userId>
    ```

    !!! hint "Git Errors"
        In case of any `Git` related error please have a look at our [**Git FAQ**](../../faq/git){target=_blank}


### 6. Check Results

After pushing to this repository as per the previous step, a build will be triggered that takes a few minutes to finish.

You will be informed via mail whether you have passed ✅ or failed ❌. In case of a failure the mail will provide some details about the errors. Don't worry: You have as many attempts as you need!

💻 **Happy Coding** 💻

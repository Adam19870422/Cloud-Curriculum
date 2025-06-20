# ASE Prerequisite Test for Java

<!-- TrackingCookie-->
{% with pagename="prerequisite-test-java" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-ase.md' %}
{% endwith %}

## 🎯 Why?

<b>A</b>gile <b>S</b>oftware <b>E</b>ngineering (Java) is a training for Development roles which have good knowledge in Java and its ecosystem.
This little test, that should not take much time for a skilled programmer, gives you a first feedback if you have the required knowledge and skills to attend the training.

## 🤔 What if I don't know what to do or can't solve it?

If you don't have all the skills yet don't worry, you can learn them.

Have a look at the [basics](../../stack-basics/java/){target=_blank}.


## 🧰 Technical Prerequisites

You will need a few things in order to work with the exercises.

- IDE e.g. [IntelliJ Community Edition](https://www.jetbrains.com/idea/download/){target=_blank}/[Spring Tool Suite](https://spring.io/tools){target=_blank}/[Visual Studio Code](https://code.visualstudio.com){target=_blank}
- [Java JDK 17 or 21](https://sap.github.io/SapMachine/#download){target=_blank}
- [Maven](https://maven.apache.org/){target=_blank}
- [Git client](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git){target=_blank}

Install them if you do not have them yet.

## 💻 Exercise

{% include 'snippets/copilot-pretest-warning.md' %}

### What do I need to do here?

For this prerequisite test you have to implement a `Developer` class and a `Hackathon` class with some very basic methods.

To do so please follow the detailed steps below.

### 1. Clone Repository & Import

{% with branch_name="ase-pretest", folder_name="ase-pretest-java" %}
{% include 'snippets/clone-import/java.md' %}
{% endwith %}


!!! hint "Git Errors"

    In case of any `Git` related error please have a look at our [**Git FAQ**](../../faq/git){target=_blank}


🚨 **Do not rename, move or modify the existing files in this project (except the ones mentioned explicitly)** 🚨

### 2. Implement the Developer class

1. Create a class called `Developer` in the package `com.sap.cc` in the src/main/java folder

1. The class should have two private fields called `name` and `language`, both of type `String`.

1. Create a constructor for the `Developer` class which accepts values for `name` and `language`, and assign them to the private fields.

1. Create getter and setter methods for both fields:

1. Make the Developer class a subclass of the `CodeCreator` class

1. Since `CodeCreator` is an abstract class we now need to implement the method named `code` that we inherit.

1. `code()` should return a String that depends on the value of the `name` and `language` properties of the `Developer` instance;
 See Examples below:

    - For `language` : `go`, `name`: `Greg` return the String

      >`fmt.Println("Hello, Greg!")`

    - For `language`: `nodejs`, `name`: `Nicole` return the String

      >`console.log("Hello, Nicole!")`

    - For `language`: `python`, `name`: `Pete` return the String

      > `print("Hello, Pete!")`

    - For any other `language`, e.g. `abap`, `swift`, `rust` etc., the method should throw a `UnsupportedDevelopmentLanguageException` with the `language` as the parameter of the Exception.

**HINT**: Quotation Marks (`"`) are special characters in Java. If you want to use them within Strings you will need to escape them with a backslash (`\`). [You can find an example here.](https://codegym.cc/groups/posts/escaping-characters-java){target=_blank}


### 3. Implement the Hackathon class

1. Create a class called `Hackathon` in the package `com.sap.cc` which implements the `DeveloperEvent` interface

1. Because of the interface, it must implement the method `codeTogether` that
 has the parameter `codeCreators`, which is a List of `CodeCreator`s (the parent class of `Developer`).

1. `codeTogether` should  call the `code()` method of each of the `codeCreators` in the List and concatenate their output into a string using a `new line` (`\n`) as the separator. This String should be returned by the method.
e.g.:

    >fmt.Println("Hello, Greg!") <br>
    console.log("Hello, Nicole!") <br>
    print("Hello, Pete!")

1. If any call to `code()` throws a `UnsupportedDevelopmentLanguageException` this must be caught and the exception's message must be appended:
e.g:

    >fmt.Println("Hello, Greg!") <br>
    console.log("Hello, Nicole!") <br>
    Unsupported language: abap <br>
    print("Hello, Pete!") <br>

**NOTE:** For simplicity's sake, the separator (`\n`) should even be appended for lists containing only one item.

### 4. Commit and Push to Personal Branch

{% with path_name="java/ase", language="Java", branch_name="ase-pretest" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}

### 5. Check Results

After pushing to this repository as per the previous step, a build will be triggered that takes a few minutes to finish.

You will be informed via mail whether you have passed ✅ or failed ❌. In case of a failure the mail will provide some details about the errors. Don't worry: You have as many attempts as you need!


## 📣 Questions/Feedback

We value your feedback and your questions, and please use the teams channel [Learner Support: Cloud Native Developer Journey](https://teams.microsoft.com/l/team/19%3a0637dnZuwlGuuRXIm95UmDW1-DxvfNDqi4cLdYkA2Ho1%40thread.tacv2/conversations?groupId=6968a57a-9594-40de-b91c-d6b197057d01&tenantId=42f7676c-f455-423c-82f6-dc2d99791af7){target=_blank} to let us know!

💻 **Happy Coding** 💻

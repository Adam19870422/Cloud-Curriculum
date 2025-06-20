# FUN Prerequisite Test for Java

<!-- TrackingCookie-->
{% with pagename="prerequisite-test-java" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-fun.md' %}
{% endwith %}

## 🎯 Why?
Cloud Development Fundamentals (Java) is a training for Development roles which have good knowledge in Java and its ecosystem.
This little test, that should not take much time for a skilled programmer, gives you a first feedback if you have the required knowledge and skills to attend the training.

## 🤔 What if I don't know what to do or can't solve it?

If you don't have all the skills yet don't worry, you can learn them.

Have a look at the [basics](../../stack-basics/java/){target=_blank}.

## 🛠️ Technical Prerequisites
For this exercise you will require the following tools:

- IDE e.g. [IntelliJ Community Edition](https://www.jetbrains.com/idea/download/){target=_blank}/[Spring Tool Suite](https://spring.io/tools){target=_blank}/[Visual Studio Code](https://code.visualstudio.com){target=_blank}
- [Java JDK 17 or 21](https://sap.github.io/SapMachine/#download){target=_blank}
- [Maven](https://maven.apache.org/){target=_blank}
- [Git client](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git){target=_blank}
{% include 'snippets/docker.md' %}


Install them if you do not have them yet.

## 📗 Exercise/Test

### 1. Clone Repository & Import

{% with branch_name="fun-pretest", folder_name="fun-pretest-java" %}
{% include 'snippets/clone-import/java.md' %}
{% endwith %}

### 2. Implement Fizz Buzz Bingo
1. Create a class called `FizzBuzzImpl` in the package `com.sap.cc.skillcheck`, that `implements` the interface `FizzBuzz` (interface is provided). You will add implementation to this class after writing tests below.

1. Make `FizzBuzzImpl` a "Spring Bean" so that Spring can inject the implementation automatically

1. Create JUnit tests in the provided `FizzBuzzTest` class testing the `FizzBuzzImpl`s `evaluate(int number)` method. Write tests for the following scenarios and implement `FizzBuzzImpl` accordingly:
    - In case number is divisible by 3, the String "Fizz" should be returned.
    - In case the number is divisible by 5, the String "Buzz" should be returned.
    - For numbers that are divisible by 3 and 5, the String "FizzBuzz" should be returned.
    - All other numbers should be printed as Strings ("1", "2", etc.).
    - If the previous result was **exactly** the same as the current one, append "Bingo" e.g.:
        - evaluate(3)->Fizz , evaluate(9)->FizzBingo , evaluate(6)->Fizz , evaluate(12)-> FizzBingo
        - evaluate(1)->1 , evaluate(1)->1Bingo , evaluate(1)->1 , evaluate(1)->1Bingo

1. Run all tests - they should be passing
1. You are expected to have 100% code coverage of the `FizzBuzzImpl` class, for this very simple code. This coverage check is pre-configured in the pom file as part of mavens `test` phase. You can test if you pass the check by building the project using maven.

**NOTE:** The only files which you should need to touch to solve the challenge are `FizzBuzzImpl` and `FizzBuzzTest`.

### 3. Generate the checksum file

In this step:

1. Open a terminal (Windows users can use `Powershell` or `Git Bash`)
1. Switch to the project directory (the directory where you checked out the project)
1. Run
	```sh
	mvn -P check-docker
	```
This will create a `checksum` file containing a hash. Leave it as it is - but don't forget to add it to your commit.

### 4. Commit and Push to Personal Branch

{% with path_name="java/fun", language="Java", branch_name="fun-pretest" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}


### 5. Check Results

After pushing to this repository as per the previous step, a build will be triggered that takes a few minutes to finish.

You will be informed via mail whether you have passed ✅ or failed ❌. In case of a failure the mail will provide some details about the errors. Don't worry: You have as many attempts as you need!


## 📣 Questions/Feedback
We value your feedback and your questions, and please use the teams channel [Learner Support: Cloud Native Developer Journey](https://teams.microsoft.com/l/team/19%3a0637dnZuwlGuuRXIm95UmDW1-DxvfNDqi4cLdYkA2Ho1%40thread.tacv2/conversations?groupId=6968a57a-9594-40de-b91c-d6b197057d01&tenantId=42f7676c-f455-423c-82f6-dc2d99791af7){target=_blank} to let us know!

💻 **Happy Coding** 💻

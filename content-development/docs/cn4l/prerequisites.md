# 🧰 Technical Prerequisites

{% include 'snippets/disclaimer-work-in-progress.md' %}

You will need a few things in order to work with the exercises.

## 🛠️ Bare minimum - agnostic

- [**Git** client](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git){target=_blank}

- A terminal (on Windows, use git bash which comes with Git client)


## 🛠️ Bare minimum - stack specific

=== "Java"
    1. **IDE** e.g. [IntelliJ Community Edition](https://www.jetbrains.com/idea/download/){target=_blank}/[Spring Tool Suite](https://spring.io/tools){target=_blank}/[Visual Studio Code](https://code.visualstudio.com){target=_blank}
    1. [**Java JDK** 17 or 21](https://sap.github.io/SapMachine/#download){target=_blank}
    1. [**Maven**](https://maven.apache.org/){target=_blank}


=== "Node.js"
    1. [**Node.js** LTS (22.x) with **NPM** (>=9)](https://nodejs.org/en/download){target=_blank}

        - If you need to manage *multiple* versions of **`node`** and / or **`npm`**, consider using a [Node Version Manager](https://github.com/npm/cli#node-version-managers){target=_blank}.

    1. **IDE** of your choice

        - We recommend [Visual Studio Code](https://code.visualstudio.com/){target=_blank} with [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig){target=_blank} and [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint){target=_blank} extensions installed for the best developer experience throughout the exercises.

=== "Python"
    1. {% filter indent(4) %}{% include 'snippets/python-install.md' %}{% endfilter %}

    1. **IDE** of your choice

        - [Visual Studio Code](https://code.visualstudio.com/){target=_blank} with [Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python){target=_blank} extension installed for the best developer experience throughout the exercises. Please check how to use [Python Testing in Visual Studio Code](https://code.visualstudio.com/docs/python/testing){target=_blank}
        - We recommend using [PyCharm Community Edition](https://www.jetbrains.com/pycharm/){target=_blank} with SAP recommendations. **For Community Edition**, please check detailed recommendations at [Software Catalog](https://software-catalog.bss.net.sap/esd/Items/Details?PackageId=4777){target=_blank} and [OST](https://open-source.tools.sap.corp/PyCharm){target=_blank}. **For Professional Edition**, please disable "Code with me" according to the following guide: [Disable JetBrains lobby address on users machines by editing system settings](https://www.jetbrains.com/help/cwm/configure-the-url-server.html#lobby_server){target=_blank}.



## Optional: 🐳 Docker

Even though you do not need <a href="https://www.docker.com/" target="_blank">**Docker**</a> for the mandatory exercises we still would like to mention it here because its needed for optional exercises on kubernetes. And you need to buy an additional license for Docker:

{% include 'snippets/docker.md' %}


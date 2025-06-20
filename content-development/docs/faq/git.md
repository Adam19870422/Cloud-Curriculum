
# Git - Frequently Asked Questions

## 🧰 Prerequisites

1. Make sure to use an up-to-date [Git Client](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git){target=_blank}

1. Make sure to have a [basic understanding of the Git](https://app.pluralsight.com/sso/sap?returnUrl=library/courses/getting-started-git/table-of-contents){target=_blank} and its [most common commands](https://www.git-tower.com/learn/git/commands){target=_blank}:

    1. [git clone](https://www.git-tower.com/learn/git/commands/git-clone){target=_blank} - Downloading an existing repository from a remote server

    1. [git status](https://www.git-tower.com/learn/git/commands/git-status){target=_blank} - Displaying uncommitted changes and the state of your Working Copy

    1. [git add](https://www.git-tower.com/learn/git/commands/git-add){target=_blank} - Adding changes to the staging area

    1. [git commit](https://www.git-tower.com/learn/git/commands/git-commit){target=_blank} - Saving changes to the local repository

    1. [git push](https://www.git-tower.com/learn/git/commands/git-push){target=_blank} - Publishing new local changes on a remote server

    1. [git pull](https://www.git-tower.com/learn/git/commands/git-pull){target=_blank} - Downloading and integrating remote changes

    1. [git checkout](https://www.git-tower.com/learn/git/commands/git-checkout){target=_blank} - Switching branches and restoring files

    1. [git remote](https://www.git-tower.com/learn/git/commands/git-remote){target=_blank} - Showing, adding and removing connections to remote repositories

## ☝️ Things to check first

1. Check which version of Git you are using.

    In your terminal, run:

    ```shell
    git version
    ```

1. Check the current branch your are working on.

    In your terminal, run:
   
    ```shell
    git rev-parse --abbrev-ref HEAD
    ```

    or with Git 2.22 and above:

    ```shell
    git branch --show-current
    ```

1. Check the names and URLs of your remote repositories 

    In your terminal, run:

    ```shell
    git remote -v
    ```

## 🙋‍♂️ Common Errors

### Clone Errors
I am getting an error when trying to **clone a repository**:

!!! error "Error"

    ```shell
    fatal: unable to access 'https://gitproxy.internal.cfapps.sap.hana.ondemand.com/x/y/':
    The requested URL returned error: 403
    ```
    !!! success "Solution"
        Make sure that you are connected to the SAP NETWORK (via VPN).

        Make sure to clone the repository using a local Git installation.  
        Business Application Studio (BAS) cannot connect to the Git proxy because BAS tries to access the repository from outside of the SAP network, which results in a 403 error from BTP.


!!! error "Error"

    ```shell
    fatal: repository 'https://gitproxy.internal.cfapps.sap.hana.ondemand.com/x/y/' not found
    ```
    !!! success "Solution"
        Make sure that you are using the correct repository URL.


!!! error "Error"

    ```shell
    error: RPC failed; HTTP 418 curl 22 The requested URL returned error: 418
    ```
    !!! success "Solution"
        Please make sure sure that your branch name matches your user id, e.g. `d123456` or `i654321`

!!! error "Error"

    ```shell
    error: src refspec fun does not match any
    error: failed to push some refs to 'https://gitproxy.internal.cfapps.sap.hana.ondemand.com/java/fun'
    ```
    !!! success "Solution"
        Likely your push command to the remote branch is not correct.
        If you don't know how to push to a remote branch with a different name, you can find help [here](https://www.freecodecamp.org/news/git-push-to-remote-branch-how-to-push-a-local-branch-to-origin/#how-to-push-to-a-branch-of-a-different-name-on-git).


!!! error "Error"

    ```shell
    [remote rejected] main -> d123456 (refusing to allow a Personal Access Token to create or update workflow '.github/workflows/runtests.yml' without 'workflow' scope
    ```
    !!! success "Solution"
        This means we updated the workflow file after you cloned the repo, which we need to do occasionally.
        Simply run the following command to fix it (make sure you are using the correct main branch e.g. `main-ts`)
        ```shell
        git pull origin main --rebase -X theirs
        ```

!!! error "Error"

        ```shell
        fatal: unable to access 'https://github.tools.sap/cloud-curriculum/exercise-code-{java|nodejs}.git/':
        The requested URL returned error: 403
        ```
    !!! success "Solution"
        You are trying to push to the wrong repository. Please use the push command provided in the "Submit your solution" step. Note that the push command for exercises is different from the pretests.

!!! error "Error"

    ```shell
    error: src refspec <local branch> does not match any
    error: failed to push some refs to 'https://gitproxy.internal.cfapps.sap.hana.ondemand.com/x/y'
    ```
    !!! success "Solution"
        Check the current branch you are working on and make sure that you are you are pushing the correct local branch to the correct remote branch.
        ```shell
        git rev-parse --abbrev-ref HEAD (or git branch --show-current)
        git push submission <local branch>:<your D/I/C userId>
        ```

!!! error "Error"

    ```shell
    ! [rejected]    main -> <your D/I/C userId> (fetch first)
    error: failed to push some refs to 'https://gitproxy.internal.cfapps.sap.hana.ondemand.com/x/y'
    hint: Updates were rejected because the remote contains work that you do
    hint: not have locally. This is usually caused by another repository pushing
    ... 
    ```
    !!! success "Solution"
        This error occurs when you already submitted the exercise in Javascript and you are trying to push in Typescript now. Appending `-f`, forcefully pushes the new code to your userid branch. See example below
        ```shell
        git push https://gitproxy.internal.cfapps.sap.hana.ondemand.com/java/http-rest http-rest-ts:<your D/I/C userId> -f
        ```

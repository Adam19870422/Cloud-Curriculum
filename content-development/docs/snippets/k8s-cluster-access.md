#### Get a Cluster
If you do not yet have a SAP BTP Trial account, please create one [here](https://account.hanatrial.ondemand.com/trial/#/home/trial){target=_blank}.

1. In the trial subaccount, click `enable kyma` to create your trial-kubernetes cluster using the default values. This will take 1-2 hours.
2. Install [Krew](https://krew.sigs.k8s.io/docs/user-guide/setup/install/){target=_blank}. This is required for the [OIDC](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#openid-connect-tokens){target=_blank} authentication to your cluster.
3. Install the oidc-login plugin for krew using `kubectl krew install oidc-login`.

    ??? error "Getting an error installing the oidc-plugin on Windows?"
        If you are getting an error like `failed to list indexes: failed to list the remote URL for index default: command execution failure, output="": exit status 1`, please make sure that you execute the oidc-login plugin install command (`kubectl krew install oidc-login`) from a command prompt (`cmd.exe`) with administrator privileges.
        Krew uses a symlink in your `%USERPROFILE%\.krew\bin` directory to install plugins, which can only by accessed from a command prompt with administrator privileges.

        You will first need to configure `kubectl` to communicate with your cluster.


#### Accessing the Cluster
1. Check whether a directory with the name `.kube` exists in your home directory.
    If not, create it.
1. Check whether the `.kube` directory contains a **file** named `config` (without file extension).
    If it does, rename it to something else, e.g. `config-old`.
1. Download the cluster config from [BTP cockpit](https://account.hanatrial.ondemand.com/trial/#/home/trial){target=_blank}.
    1. Click on your trial subaccount.
    2. From the `Kyma Environment` section, click on KubeconfigURL to download the kubeconfig file. 
1. Copy the downloaded file to the `.kube` directory and rename the **file** to `config`. (without any extension)
1. Verify that the config has been applied correctly by running the following command:
    ```shell
    kubectl cluster-info
    ```

    ??? info "Two-Factor Authentication"
        Browser window is automatically opened with Two-factor authentication. In order to log in, you need to have the Authenticator app set up.

1. It should print a message similar to the following, with `<SUBDOMAIN>` being replaced:
```
Kubernetes control plane is running at https://api.<SUBDOMAIN>.kyma.ondemand.com
CoreDNS is running at https://api.<SUBDOMAIN>.kyma.ondemand.com/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
```

1. Remember the `<SUBDOMAIN>` name (or the fact that you can get it using the above command), you will need it later.

1. **Log in** to the **eu12** landscape **before you do anything else** 
    ```bash
    cf login -a https://api.cf.eu12.hana.ondemand.com
    ```
    This is required for your shadow-user to be created on the landscape.

    !!! warning "Having issues logging in? Does your password not work as expected?"

        Does your account have 2FA enabled? If yes, logging in to Cloud Foundry is only possible using the `--sso` parameter e.g. `cf login --sso`.

        If for some reason `--sso` does not work for you, please see instructions on how to use [Hard/Soft RSA Token with your password](https://wiki.one.int.sap/wiki/display/CPUAM/Usage+CF+CLI#UsageCFCLI-LogOntotheCloudFoundryEnvironmentUsingtheCloudFoundryCommandLineInterface) (you will have to append the T-OTP to the end of your password as described in the article)


2. Go to this [page](https://cndj-cf-provisioning.cfapps.sap.hana.ondemand.com/cfprovisioning){target=_blank}, fill out the form and create your space
3. After successful space creation via the tool, switch to your space within the org 
    ```bash
    cf target -o dev-learning-trial -s (your d/i-number)
    ```

### Clean up 🧹

Even though Kyma trial clusters will be deleted entirely after 14 days, we should remove all unused resources in order to reduce overall infrastructure cost.

If you completed the current exercise, but need the cluster for the next exercises, delete the deployments/pods/services etc related to the current exercise

1. `kubectl delete -f [FILENAME_OR_FOLDER]` for all kubectl configuration files you applied before (e.g. `kubectl delete -f deployment.yaml`)
1. `kubectl delete [RESOURCE_TYPE] [RESOURCE_NAME]` for all resources you applied without using a file

If you no longer need the cluster, delete it:

1. Go to your subaccount in the [BTP Cockpit](https://account.hanatrial.ondemand.com/trial/#/){target=_blank}
1. Click on the `Disable Kyma` button in the `Kyma Environment` section.
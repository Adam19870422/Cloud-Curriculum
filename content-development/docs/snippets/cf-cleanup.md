### Clean up 🧹

Even though we will take care of the CF space deletion after 14 days, we should remove all unused resources in order to reduce overall infrastructure cost.

1. Run `cf apps` to get a list of your apps
1. Use the command `cf stop [APP_NAME]`, followed by `cf delete [APP_NAME]`, to stop and delete the app instances
1. Run `cf apps` again and make sure the apps are not existing anymore
1. Run `cf services` to get a list of your services
1. Use `cf delete-service [SERVICE_NAME]` to delete each service. Depending on the type of service this can take some time, go ahead and grab a ☕ if you want to.
1. Verify the deletion of services via the command `cf services`
1. Remove all unused routes using the command `cf delete-orphaned-routes`

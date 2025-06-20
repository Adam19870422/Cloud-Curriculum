# Kubernetes Help

In this file we have collected some useful kubectl commands and YAML examples that will help you during the exercise.

## kubectl Commands

Here are some popular kubectl commands that you will likely need during your work with K8s.

- Information gathering
    - [kubectl get](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#get)
    - [kubectl describe](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#describe)
    - [kubectl explain](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#explain) 
- App management
    - [kubectl apply](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#apply) 
    - [kubectl delete](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#delete) 
- Troubleshooting
    - [kubectl logs](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#logs)
    - [kubectl exec](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#exec)

## YAML Examples of K8s Objects

Here are some examples of how to define resources with YAML so that it's easier for you to get started.

### Pod

```YAML
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: nginx
    image: nginx:mainline
    ports:
    - containerPort: 80
      name: http-port
```

### Deployment

```YAML
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sample-app
spec:
  replicas: 1           # number of desired pods
  selector:             # used to identify the pods after creation
    matchLabels:
      app: sample-app   # must match the template label
  template:
    metadata:
      labels:
        app: sample-app # label that will be attached to pods
    spec:
      containers:
        - name: app
          image: nginx:mainline
          ports:
            - containerPort: 3000
          imagePullPolicy: Always
```

- Using [labels and selectors](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/), sets of objects can be identified, e.g. pods belonging to a deployment.

### Service

```YAML
apiVersion: v1
kind: Service
metadata:
  name: sample-app      # a DNS entry is created for the service name
spec:
  selector:             # determines target pods
    app: sample-app
  ports:
    - port: 80
      targetPort: 3000
  type: LoadBalancer    # there are different types of Services
```

### Ingress

```YAML
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  labels:
    garden.sapcloud.io/purpose: managed-cert # gardener specific attribute, see below
  name: sample-app
spec:
  rules:                # list of rules used to configure the ingress
  - host: app.ingress.trial.train-k8s.shoot.canary.k8s-hana.ondemand.com
    http:
      paths:            # a collection of paths that map requests to backends
      - backend:
          serviceName: sample-app   # name of the referenced service
          servicePort: 3000         # specifies the port of the referenced service
        path: /                     # path that is matched against the path of an incoming request
  tls:
  - hosts:
    - app.ingress.trial.train-k8s.shoot.canary.k8s-hana.ondemand.com
    secretName: registry-certs
```

- [garden.sapcloud.io/purpose: managed-cert](https://github.com/gardener/cert-management#requesting-a-certificate-for-ingress)

### PersistentVolumeClaim

```YAML
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: storageclaim
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

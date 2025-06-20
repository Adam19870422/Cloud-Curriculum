## Architecture Overview

<object data="./images/k8s_architecture_overview.svg" type="image/svg+xml" width="850px" />

Notes:
<!-- HINT: first, give a quick overview of "left" and "right" side -->
- Illustration of a cluster deployed with K8s
- Right side:
  - Set of worker machines, called nodes, that run containerized applications
    - every cluster has at least one worker node
  - The worker nodes host the Pods that are the components of the application
- Left side:
  - Control plane that manages the worker nodes and the Pods
  - makes global decisions about the cluster
    - e.g. scheduling
    - e.g. detecting and responding to cluster events (starting up a new pod when a deployments replica field is unsatisfied)
 <!-- HINT: then, give an overview to the single components -->
 - API Server: 
  - center piece: all requests towards the cluster go through it
  - exposes the K8s API via REST Operations
  - lets you query and manipulate the state of objects (for example: Pods, Namespaces, ConfigMaps, and Events).
- kubectl:
  - CLI that talks via REST to the API Server
  - perform cluster administration tasks
  - user tasks like creating, deleting and modifying of resources
- etcd:
  - consistent and highly-available key-value store
  - used as K8s backing store for all cluster data
- kube-scheduler:
  - watches for newly created pods with no assigned node
  - selects a node for them to run on
  - factors for scheduling include: resource requirements, hardware/software/policy constraints, data locality etc...
- kube-controller-manager:
  - runs controller processes
  - various controllers are working to align the spec of a resource and its state
- kubelet:
  - runs on every node in a cluster
  - makes sure that containers are running in a Pod with the specified PodSpecs
- kube-proxy:
  - runs on each node and reflects services as defined in the Kubernetes API
- Container runtime:
  - the software responsible for running containers
  - supports Docker, containerd, CRI-O (any implementation of K8s Container Runtime Interface)
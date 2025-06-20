#!/bin/sh -e
copySlides()
{
  ORIGIN=$1
  TARGET=$2
  mkdir -p "$TARGET" && cp -r "$ORIGIN"/* "$TARGET"
}


docker build -t mkdocs-material-user-provided-values:latest .
docker run --rm -v $(pwd):/docs --entrypoint mkdocs mkdocs-material-user-provided-values:latest build

# To publish slides when no exercise exists (yet) use the following command:
# mkdir -p site/my-topic && cp -r ../my-topic site/my-topic/slides
copySlides ../auth site/auth/slides
copySlides ../cloud-microservices site/cloud-microservices/slides
copySlides ../cloud-platforms site/cloud-platforms/slides
copySlides ../continuous-delivery site/continuous-delivery/slides
copySlides ../async site/async/slides
copySlides ../logging site/logging/slides
copySlides ../persistence site/persistence/slides
copySlides ../distributed-logging site/distributed-logging/slides
copySlides ../service2service site/service2service/slides
copySlides ../release-toggles site/release-toggles/slides
copySlides ../genai-tooling site/genai-tooling/slides
copySlides ../legacy-code site/legacy-code/slides


cp ../customReveal.css site/

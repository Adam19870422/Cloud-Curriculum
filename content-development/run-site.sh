SITE=$1

if [ -z "$SITE" ]; then
  echo "Please provide a site name (all/cndj/leaders) as an argument: \"./run-site.sh [SITE]\", e.g. \"./run-site.sh cndj\""
  exit 1
fi

docker build --tag "cc-exercices-$SITE" -f "./z_site_specific/$SITE/Dockerfile" . && docker run --rm -it -p 8000:8000 -v ${PWD}/docs:/docs/docs  "cc-exercices-$SITE"
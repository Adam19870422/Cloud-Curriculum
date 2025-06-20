#!/bin/sh -e

GITHUB_TOKEN=$1
DIR=$(pwd)
rm -rf target

. ./buildTrippleSite.sh

cd $DIR
cd target
touch .nojekyll
git init
git config user.email dl_5d1c6debf0cd7f027fd1b8c3@global.corp.sap
git config user.name Materials Builder
git checkout -b gh-pages-local
git add -A
git commit -m "Github pages build"
git push "https://x-access-token:${GITHUB_TOKEN}@github.tools.sap/cloud-curriculum/materials" gh-pages-local:gh-pages -f

echo 'done'

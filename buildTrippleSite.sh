#!/bin/bash


rm -rf target
mkdir -p target
rm -rf tmp
mkdir -p tmp

mkdir -p target/cndj
mkdir -p target/all
mkdir -p target/leaders



######### Build ALL Site

# copy content-development site to tmp dir
cp -r content-development/* tmp
cd tmp

# Use index.md as the index file for "all"
cp z_site_specific/all/index-all-java.md docs/index.md
cp z_site_specific/all/index-all-nodejs.md docs/index-nodejs.md
cp z_site_specific/all/index-all-python.md docs/index-python.md

# By default build site with all modules linked
./build-site.sh
cp -r site/* ../target/all
# no copy necessary as mkdocs.yml in folder is the one for "all"
rm -rf ./*


######### Build CNDJ Site

# Now use cndj specific yml file
cp -r ../content-development/* .
cp z_site_specific/cndj/mkdocs-cndj.yml mkdocs.yml

# Use CNDJ indexes as the index files
cp z_site_specific/cndj/index-cndj-java.md docs/index.md
cp z_site_specific/cndj/index-cndj-nodejs.md docs/index-nodejs.md

./build-site.sh
cp -r site/* ../target/cndj
rm -rf ./*


######### Build Leaders Site

# Now use leaders specific yml file
cp -r ../content-development/* .
cp z_site_specific/leaders/mkdocs-leaders.yml mkdocs.yml
# Use leaders indexes as the index files
cp z_site_specific/leaders/index.md docs/index.md

find . -type f -exec sed -i 's|https://pages.github.tools.sap/cloud-curriculum/materials/cndj/|https://pages.github.tools.sap/cloud-curriculum/materials/leaders/|g' {} \;


cp -r z_site_specific/leaders/assets docs/assets

./build-site.sh
cp -r site/* ../target/leaders
rm -rf ./*

######### Add custom 404 page
cp ../404.html ../target

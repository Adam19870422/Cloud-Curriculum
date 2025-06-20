FROM squidfunk/mkdocs-material:8.1.11

COPY . /docs
COPY ./z_site_specific/leaders/ /docs
COPY ./z_site_specific/leaders/mkdocs-leaders.yml ./mkdocs.yml

RUN pip install pathspec
RUN pip install mkdocs-user-defined-values
RUN pip install mkdocs-macros-plugin

USER 1000:1000
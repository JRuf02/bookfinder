FROM node:23-alpine3.20

LABEL maintainer="Julian Gabriel Ruf <rufju@informatik.uni-freiburg.de>"

RUN apk add git openssh python3 py3-pip make sqlite
RUN npm install -g npm@11.1.0

# TODO add docker setup commands as comments here
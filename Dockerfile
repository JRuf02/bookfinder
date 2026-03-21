FROM node:23-alpine3.20

LABEL maintainer="Julian Gabriel Ruf <rufju@informatik.uni-freiburg.de>"

RUN apk add git openssh python3 py3-pip make sqlite curl
RUN npm install -g npm@11.1.0

# setup python
RUN mkdir -p /workspaces/isbn-scanner-venv
WORKDIR /workspaces/isbn-scanner-venv
RUN python3 -m venv .venv && \
source .venv/bin/activate && \
pip install mypy==1.19.1 pytest==9.0.2 Flask==3.1.3 Flask_Cors==4.0.0 types-Flask-Cors==6.0.0.20250809 pysqlite3==0.6.0 requests==2.31.0 types-requests==2.32.4.20260107


WORKDIR /workspaces/isbn-scanner

# copy files
# run npm install and other post create commands

# specify entrypoint or command
# WORKDIR /app
# CMD ["npm", "start"]

# TODO add docker setup commands as comments here
# with the correct port forwarding args (take them from devcontainer.json)
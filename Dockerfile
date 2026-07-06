FROM node:23-alpine3.20

LABEL maintainer="Julian Gabriel Ruf <rufju@informatik.uni-freiburg.de>"

RUN apk update
RUN apk add git openssh python3 py3-pip make sqlite curl caddy
RUN npm install -g npm@11.1.0


# setup python
RUN mkdir -p /workspaces/isbn-scanner-venv
WORKDIR /workspaces/isbn-scanner-venv
RUN python3 -m venv .venv && \
source .venv/bin/activate && \
pip install \
mypy==1.19.1 \
pytest==9.0.2 \
ruff==0.15.7 \
Flask==3.1.3 \
Flask_Cors==4.0.0 \
types-Flask-Cors==6.0.0.20250809 \
pysqlite3==0.6.0 \
requests==2.31.0 \
types-requests==2.32.4.20260107 \
defusedxml==0.7.1 \
camel-converter==5.1.0 \
isbnlib==3.10.14 \
http-constants==0.5.0 \
pillow==12.2.0 \
fixtures==4.3.2 \
requests-mock==1.12.1 \
fuzzysearch==0.8.1 \
gunicorn==26.0.0


WORKDIR /workspaces/isbn-scanner
# Copy package files from cached layer (tsserver would be slow if package were within the bind mount)
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install



# copy files
# run npm install and other post create commands

# specify entrypoint or command
# WORKDIR /app
# CMD ["npm", "start"]

# TODO add docker setup commands as comments here
# with the correct port forwarding args (take them from devcontainer.json)
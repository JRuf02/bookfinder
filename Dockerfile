FROM node:23-alpine3.20

LABEL maintainer="Julian Gabriel Ruf <rufju@informatik.uni-freiburg.de>"

RUN apk update
RUN apk add git openssh python3 py3-pip make sqlite curl caddy openssl
RUN npm install -g npm@11.1.0


# setup python
RUN mkdir -p /workspaces/bookfinder-venv
WORKDIR /workspaces/bookfinder-venv
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
gunicorn==26.0.0 \
pendulum==3.2.0 \
python-dateutil==2.9.0.post0 \
six==1.17.0 \
tzdata==2026.3


WORKDIR /workspaces/bookfinder
# Copy package files from cached layer (tsserver would be slow if package were within the bind mount)
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install


# copy files
COPY . /workspaces/bookfinder

# run npm install and other post create commands
RUN make setup

# specify entrypoint or command
# WORKDIR /app
# CMD ["npm", "start"]


# BUILD INSTRUCTIONS
# git clone https://github.com/JRuf02/bookfinder.git
# cd bookfinder
# docker build -t julian-ruf-project .
# docker run -it -p 5173:5173 -p 5000:5000 -p 443:443 --name julian-ruf-project julian-ruf-project sh
# make run-prod

# EXIT THE CONTAINER
# ctrl + c
# ctrl + ad

# ADDITIONAL COMMANDS
# Start without rebuilding (if docker build and docker run have already been executed):
# docker start -ai julian-ruf-project
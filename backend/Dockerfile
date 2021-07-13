ARG BASE_IMAGE="node:14"
FROM $BASE_IMAGE

RUN apt-get update \
    && apt-get install -y vim \
    && apt-get install -y postgresql

WORKDIR /usr/src/app
COPY package.json /usr/src/app

ARG NPM_REGISTRY="http://10.194.9.122"
RUN npm install -g nodemon \
    && npm install -g sequelize-cli \
    && npm install -g jest \
    && npm config set registry "$NPM_REGISTRY" \
    && npm install

COPY . /usr/src/app

EXPOSE 8990
CMD ./start.sh

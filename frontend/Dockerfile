ARG BASE_IMAGE="node:14"
FROM $BASE_IMAGE

WORKDIR /usr/src/app
COPY package.json /usr/src/app

ARG NPM_REGISTRY="http://10.194.9.122"
RUN npm config set registry "$NPM_REGISTRY" \
    && npm install -g jest \
    && npm install

COPY . /usr/src/app
EXPOSE 8080

CMD PORT=8080 yarn start

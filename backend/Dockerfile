ARG BASE_IMAGE="node:14"
FROM $BASE_IMAGE

SHELL ["/bin/bash", "-c"]

USER root
RUN (type -P "yum" &> /dev/null) && ( \
        yum install -y \
            git \
            vim \
            postgresql
        && yum clean all \
        && rm -rf /var/cache/yum \
     ) || ((type -P "apt-get" &> /dev/null) && ( \
        apt-get update \
        && apt-get install -y \
            git \
            vim \
            postgresql
        && apt-get clean \
        && rm -rf /var/cache/apt/lists \
    )) || ( \
        >&2 echo "[ERROR] Unsupported Base Image" \
        && exit 1 \
    )
USER node

ENV APP_DIR="${HOME:-/home/node}"
ENV APP_BIN="${APP_DIR}/node_modules/.bin"
ENV PATH="${APP_BIN}:${PATH}"

WORKDIR "${APP_DIR}"
COPY package.json "${APP_DIR}"

ARG NPM_REGISTRY="http://10.194.9.122"
RUN npm install nodemon \
    && npm install sequelize-cli \
    && npm install jest \
    && npm config set registry "$NPM_REGISTRY" \
    && npm install

COPY . "${APP_DIR}"

EXPOSE 8990
CMD ./start.sh

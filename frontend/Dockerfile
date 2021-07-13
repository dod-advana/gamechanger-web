ARG BASE_IMAGE="node:14"
FROM $BASE_IMAGE

SHELL ["/bin/bash", "-c"]

# to support RHEL-based and DEBIAN-based version of node
# e.g. RHEL-based node images in ironbank, DEBIAN-based ones in docker hub
USER root
RUN (type -P "yum" &> /dev/null) && ( \
        yum install -y \
            git \
        && yum clean all \
        && rm -rf /var/cache/yum \
     ) || ((type -P "apt-get" &> /dev/null) && ( \
        apt-get update \
        && apt-get install -y \
            git \
        && apt-get clean \
        && rm -rf /var/cache/apt/lists \
    )) || ( \
        >&2 echo "[ERROR] Unsupported Base Image" \
        && exit 1 \
    )
USER node
# thou shall not root

ENV APP_DIR="${HOME:-/home/node/app}"
ENV APP_BIN="${APP_DIR}/node_modules/.bin"
ENV PATH="${APP_BIN}:${PATH}"

WORKDIR "${APP_DIR}"
COPY --chown=$USER package.json "${APP_DIR}"

ARG NPM_REGISTRY="http://10.194.9.122"
RUN npm config set registry "$NPM_REGISTRY" \
    && npm install jest \
    && npm install

COPY --chown=$USER . "${APP_DIR}"
EXPOSE 8080

CMD PORT=8080 yarn start

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

# non-root app USER/GROUP
ARG APP_UID=1000
ARG APP_GID=1000

USER "$APP_UID:$APP_GID"
# thou shall not root

ENV APP_DIR="${HOME:-/home/node/app}" 
ENV APP_BIN="${APP_DIR}/node_modules/.bin" 
ENV PATH="${APP_BIN}:${PATH}"
RUN mkdir -p \
    "${APP_DIR}"

WORKDIR "${APP_DIR}"

# note on copy+chown: do not use $USER var, it will - surprisingly - be root
COPY --chown="$APP_UID:$APP_GID" package.json "${APP_DIR}"
COPY --chown="$APP_UID:$APP_GID" .npmrc "${APP_DIR}"

RUN npm install jest \
    npm install

COPY --chown="$APP_UID:$APP_GID" . "${APP_DIR}"
EXPOSE 8080

CMD PORT=8080 yarn start

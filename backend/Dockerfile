FROM node:14
WORKDIR /usr/src/app
COPY package.json .npmrc package-lock.json* /usr/src/app/
RUN npm ci && npm cache clean --force
RUN apt-get update && apt-get install -y vim && apt-get install -y postgresql
RUN npm install -g nodemon \
    && npm install -g sequelize-cli
COPY . /usr/src/app
EXPOSE 8990
CMD ./start.sh
# CMD sleep 600000

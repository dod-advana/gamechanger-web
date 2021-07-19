FROM node:14
RUN apt-get update && apt-get install -y vim && apt-get install -y postgresql
WORKDIR /usr/src/app
COPY package.json /usr/src/app
COPY .npmrc /usr/src/app
RUN npm install -g nodemon \
    && npm install -g sequelize-cli \
    && npm install -g jest \
    && npm install
COPY . /usr/src/app
EXPOSE 8990
CMD ./start.sh
# CMD sleep 600000

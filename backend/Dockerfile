FROM node:10
RUN apt-get update && apt-get install -y vim
RUN npm config set registry http://10.194.9.122
RUN npm install -g nodemon
RUN npm install -g sequelize-cli
RUN npm install -g jest
WORKDIR /usr/src/app
COPY package.json /usr/src/app
RUN npm install
COPY . /usr/src/app
RUN mkdir /etc/secrets/
COPY ./secrets/* /etc/secrets/
EXPOSE 8990
# EXPOSE 5860
CMD nodemon index.js
# CMD sleep 600000
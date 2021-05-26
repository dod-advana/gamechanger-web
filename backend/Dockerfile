FROM node:14
RUN apt-get update && apt-get install -y vim && apt-get install -y postgresql
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
CMD ./start.sh
# CMD sleep 600000
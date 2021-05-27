FROM 10.194.9.80:5000/node:14
RUN apt-get update && apt-get install -y vim && apt-get install -y postgresql
WORKDIR /usr/src/app
COPY package.json /usr/src/app
RUN npm install -g nodemon && npm install -g sequelize-cli && npm install -g jest && npm config set registry http://10.194.9.122 && npm install
COPY . /usr/src/app
RUN mkdir /etc/secrets/
COPY ./secrets/* /etc/secrets/
EXPOSE 8990
CMD ./start.sh
# CMD sleep 600000
FROM 10.194.9.80:5000/node:14
RUN apt-get update && apt-get install -y vim && apt-get install -y postgresql
WORKDIR /usr/src/app
COPY package.json /usr/src/app
RUN ["/bin/bash", "-c", "npm -version"]
RUN ["/bin/bash", "-c", "npm install -g nodemon"]
RUN ["/bin/bash", "-c", "npm install -g sequelize-cli"]
RUN ["/bin/bash", "-c", "npm install -g jest"]
RUN npm config set registry http://10.194.9.122
RUN npm install
COPY . /usr/src/app
RUN mkdir /etc/secrets/
COPY ./secrets/* /etc/secrets/
EXPOSE 8990
CMD ./start.sh
# CMD sleep 600000
FROM node:14
# RUN apt-get update && apt-get install -y vim
WORKDIR /usr/src/app
COPY package.json /usr/src/app
RUN npm config set registry http://10.194.9.122 && npm install -g jest && npm install
COPY . /usr/src/app
EXPOSE 8080
# EXPOSE 5860
CMD PORT=8080 yarn start
# CMD sleep 600000
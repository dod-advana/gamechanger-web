FROM node:14
# RUN apt-get update && apt-get install -y vim
WORKDIR /usr/src/app
COPY package.json /usr/src/app
COPY .npmrc /usr/src/app
RUN yarn install
COPY . /usr/src/app
EXPOSE 8080
CMD npm run dev

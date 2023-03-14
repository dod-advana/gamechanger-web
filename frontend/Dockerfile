FROM node:18.8.0
# RUN apt-get update && apt-get install -y vim
WORKDIR /usr/src/app
COPY package.json /usr/src/app
COPY yarn.lock /usr/src/app
COPY .npmrc /usr/src/app
RUN yarn install --frozen-lockfile --network-timeout 90000
COPY . /usr/src/app
EXPOSE 8080
CMD npm run dev

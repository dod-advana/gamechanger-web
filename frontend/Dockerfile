FROM 10.194.9.80:5000/node:14
# RUN apt-get update && apt-get install -y vim
WORKDIR /usr/src/app
COPY package.json /usr/src/app
RUN npm config set registry http://10.194.9.122 && npm install -g jest && npm install
COPY . /usr/src/app
EXPOSE 3000
# EXPOSE 5860
CMD npm run dev
# CMD sleep 600000
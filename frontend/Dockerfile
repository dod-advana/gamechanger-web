FROM 10.194.9.80:5000/node:14
# RUN apt-get update && apt-get install -y vim
RUN npm config set registry http://10.194.9.122
RUN npm install -g jest
WORKDIR /usr/src/app
COPY package.json /usr/src/app
RUN npm install
COPY . /usr/src/app
EXPOSE 3000
# EXPOSE 5860
CMD npm run dev
# CMD sleep 600000
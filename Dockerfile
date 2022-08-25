FROM node:16

WORKDIR /workdir

COPY main.js .
COPY package.json .

RUN npm i

# need to set DB_URL='http://admin:password@127.0.0.1:5984/'  

CMD ["node","main.js"]

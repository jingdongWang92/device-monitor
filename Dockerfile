FROM fishead/node-jcnetwork:8-alpine

COPY package.json /usr/src/app/
COPY yarn.lock /usr/src/app/
RUN yarn --production && \
    yarn cache clean
COPY . /usr/src/app

CMD ["node",  "src/index.js"]

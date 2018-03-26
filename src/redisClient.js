'use strict';
const redis = require("redis");
let client = null;

module.exports = (() => {
  if (!client) {
    let options = {
      port: process.env.REDIS_PORT || 6379,
      host: process.env.REDIS_HOST || '127.0.0.1',
      password: process.env.REDIS_PASSWORD,
    };
    client = redis.createClient(options);
    client.auth(process.env.REDIS_PASSWORD, redis.print);
    client.on('error', (err) => {
      console.log("Error " + err);
    });

    client.on('ready', () => {
      console.log('redis is ready!');
    });
  }
  return client;
})();

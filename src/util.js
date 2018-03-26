'use strict';
const request = require('request');
const redis = require('./redisClient');

const sms = {
  account: process.env.SMS_ACCOUNT,
  pswd: process.env.SMS_PASSWORD,
}

module.exports.sendSMS = function(mobile, msg) {
  let url = `http://send.18sms.com/msg/HttpBatchSendSM?needstatus=true
  &account=${sms.account}
  &pswd=${sms.pswd}
  &mobile=${mobile}&msg=${msg}`;
  return new Promise((resolve, reject) => {
    request.get(url.replace(/\n/, ''), (err, res) => {
      console.log(err);
      console.log(res.body);
      err ? reject(new Error(err)) : resolve(res);
    })
  });
};

module.exports.redisGet = function(key) {
  return new Promise((resolve, reject) => {
    redis.get(key, (err, reply) => {
      !err ? resolve(reply) : reject(err);
    });
  });
};

module.exports.redisStore = function(key, val, expired) {
  return redis.setex(key, expired, val);
};

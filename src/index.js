'use strict';


require('dotenv').config({ silent: true });
require('mongoose').Promise = Promise;

const Gateway = require('@paas/db-mongoose/models/gateway')(process.env.MONGO_URI);
const validator = require('validator');
const moment =  require('moment');
const util = require('./util');

if (!module.parent) {

  const administrators = (process.env.ADMINISTRATORS || '')
      .split(',')
      .map(admin => admin.trim());

  setInterval(async function() {
    console.log('=================================================');
    let gateways = await Gateway.find().populate('client').exec();
    const offlineGateways = [];
    try {
      await Promise.all(gateways.map(async gateway => {
        const data = await util.redisGet(`gw-${gateway.device_eui}`);
        const gatewayInfo = JSON.parse(data+'');
        const gatewayIsOffline = new Date().getTime() - gatewayInfo.gwTimeUtc > process.env.TIMEOUT_PERIOD;
        Object.assign(gateway,{
          is_online: !gatewayIsOffline,
          last_report_time: moment(gatewayInfo.gwTimeUtc).format('YYYY-MM-DD hh:mm:ss'),
        });
        await gateway.save();

        if(gatewayIsOffline) {
          //判断该设备的告警消息当天是否已经处理过
          const ishandled = await util.redisGet(`warning-${gateway.device_eui}${moment().format('YYYYMMDD')}`)
          console.log(ishandled);
          if(!ishandled) {
            console.log(`${gateway.client.name}-----${gateway.device_eui}-----${moment(gatewayInfo.gwTimeUtc).format('YYYY-MM-DD hh:mm:ss')}`);
            offlineGateways.push(`${gateway.client.name}-${gateway.device_eui}`);
            await util.redisStore(`warning-${gateway.device_eui}${moment().format('YYYYMMDD')}`, '1', process.env.WARNNING_DURATION);
          }
          console.log(offlineGateways);
        }

      }));

      if(offlineGateways.length > 0) {
        const warningMsg = encodeURI(`以下网关已掉线,请及时处理！\n ${offlineGateways.toString()}`);
        administrators.map(async admin => {
          if(validator.isMobilePhone(`${admin}`,'any')) {
            await util.sendSMS(admin, warningMsg);
            console.log(`告警消息已发送给${admin}`);
          }
        });
      }
    } catch (err) {
      console.log(err);
    }
    console.log('=================================================');
  }, process.env.INTERVAL);
  const port = process.env.PORT || 3000;
}

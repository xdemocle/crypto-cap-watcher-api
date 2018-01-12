const https = require('https');
const config = require('./config');
const localData = require('./local-data');
const utils = require('./utils');

function retrieveData() {
  https.get(config.coinmarketcapUrl, (res) => {
    let body = '';

    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      const response = JSON.parse(body);
      localData.updateData(response);
      console.log('Got a response: Last Updated', response.last_updated);
    });
  }).on('error', (e) => {
    console.log('Got an error in retrieving data: ', e.errno);
    utils.ping(e.host, () => {
      retrieveData();
    });
  });
}

function start() {
  retrieveData();

  const checkSecs = config.checkEachMinutes * 60 * 1000;

  setInterval(() => {
    retrieveData();
  }, checkSecs);
}

module.exports = {
  start
};

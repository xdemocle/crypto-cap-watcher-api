const https = require('https');
const config = require('./config');
const localData = require('./local-data');

function retrieveData() {
  https.get(config.coinmarketcapUrl, (res) => {
    let body = '';

    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      const response = JSON.parse(body);
      localData.updateCollection(response);
      console.log('Got a response: ', response);
    });
  }).on('error', (e) => {
    console.log('Got an error: ', e);
  });
}

function start() {
  retrieveData();

  const checkSecs = config.checkEachMinutes * 60 * 1000;

  // const intervalObj = setInterval(() => {
  setInterval(() => {
    // console.log('interviewing the interval');
    retrieveData();
  }, checkSecs);
}

module.exports = {
  start
};

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
      const responseRAW = JSON.parse(body);
      const response = handleResponse(responseRAW);
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

function handleResponse(response) {
  return {
    "total_market_cap_usd": response.data.quotes.USD.total_market_cap,
    "total_24h_volume_usd": response.data.quotes.USD.total_volume_24h,
    "bitcoin_percentage_of_market_cap": response.data.bitcoin_percentage_of_market_cap,
    "active_currencies": response.data.active_cryptocurrencies,
    "active_markets": response.data.active_markets,
    "last_updated": response.data.last_updated
  };
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

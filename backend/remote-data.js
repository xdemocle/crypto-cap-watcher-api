const https = require('https');
const config = require('./config');
const localData = require('./local-data');
const utils = require('./utils');

/**
 * TODO: adding error handler
 */
function combinedRemoteCalls() {
  const globalResponse = getContent(config.coinmarketcapUrls.global);
  const ethereumResponse = getContent(config.coinmarketcapUrls.ethereum);

  Promise.all([globalResponse, ethereumResponse])
    .then((res) => {
      const mainResponse = JSON.parse(res[0]);
      const ethereumResponse = JSON.parse(res[1]);

      mainResponse.data.ethereum_market_cap = ethereumResponse.data.quotes.USD.market_cap;

      const combinedResponse = handleCombinedResponse( mainResponse );

      localData.updateData( combinedResponse );

      console.log('Got a response: Last Updated', combinedResponse.last_updated);
    });
}

function handleCombinedResponse(response) {
  return {
    "total_market_cap_usd": response.data.quotes.USD.total_market_cap,
    "total_24h_volume_usd": response.data.quotes.USD.total_volume_24h,
    "bitcoin_percentage_of_market_cap": response.data.bitcoin_percentage_of_market_cap,
    "ethereum_percentage_of_market_cap": utils.calculateEthereumPercentageOfMarketCap(
      response.data.ethereum_market_cap, response.data.quotes.USD.total_market_cap),
    "active_currencies": response.data.active_cryptocurrencies,
    "active_markets": response.data.active_markets,
    "last_updated": response.data.last_updated
  };
}

function getContent(url) {
  // return new pending promise
  return new Promise((resolve, reject) => {
    // select http or https module, depending on reqested url
    const lib = url.startsWith('https') ? require('https') : require('http');
    const request = lib.get(url, (response) => {
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
         reject(new Error('Failed to load page, status code: ' + response.statusCode));
       }
      // temporary data holder
      const body = [];
      // on every content chunk, push it to the data array
      response.on('data', (chunk) => body.push(chunk));
      // we are done, resolve promise with those joined chunks
      response.on('end', () => resolve(body.join('')));
    });
    // handle connection errors of the request
    request.on('error', (err) => reject(err))
    })
}

function start() {
  combinedRemoteCalls();

  const checkSecs = config.checkEachMinutes * 60 * 1000;

  setInterval(() => {
    combinedRemoteCalls();
  }, checkSecs);
}

module.exports = {
  start
};

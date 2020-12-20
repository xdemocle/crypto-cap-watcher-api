const https = require("https");
const rp = require("request-promise");
const config = require("./config");
const localData = require("./local-data");
const utils = require("./utils");

/**
 * TODO: adding error handler
 */
function combinedRemoteCalls() {
  const globalResponse = getContent(config.coinmarketcap.globalPath);
  const ethereumResponse = getContent(config.coinmarketcap.ethereumPath);

  Promise.all([globalResponse, ethereumResponse])
    .then((res) => {
      const mainResponse = JSON.parse(res[0]);
      const ethereumResponse = JSON.parse(res[1]);

      mainResponse.data.ethereum_market_cap =
        ethereumResponse.data["1027"].quotes.USD.market_cap;

      const combinedResponse = handleCombinedResponse(mainResponse);

      localData.updateData(combinedResponse);

      console.log(
        "Got a response: Last Updated",
        combinedResponse.last_updated
      );
    })
    .catch((err) => {
      console.log(err);
    });
}

function handleCombinedResponse(response) {
  return {
    total_market_cap_usd: response.data.quotes.USD.total_market_cap,
    total_24h_volume_usd: response.data.quotes.USD.total_volume_24h,
    bitcoin_percentage_of_market_cap:
      response.data.bitcoin_percentage_of_market_cap,
    ethereum_percentage_of_market_cap: utils.calculateEthereumPercentageOfMarketCap(
      response.data.ethereum_market_cap,
      response.data.quotes.USD.total_market_cap
    ),
    active_currencies: response.data.active_cryptocurrencies,
    active_markets: response.data.active_markets,
    last_updated: response.data.last_updated,
  };
}

async function getContent(url) {
  const requestOptions = {
    method: "GET",
    uri: url,
    // qs: {
    //   start: "1",
    //   limit: "1",
    //   convert: "USD",
    // },
    headers: {
      "X-CMC_PRO_API_KEY": config.coinmarketcap.apikey,
    },
    json: true,
    gzip: true,
  };

  const response = await rp(requestOptions);

  console.log("API call response:", response);

  return response;
}

function start() {
  combinedRemoteCalls();

  const checkSecs = config.checkEachMinutes * 60 * 1000;

  setInterval(() => {
    combinedRemoteCalls();
  }, checkSecs);
}

module.exports = {
  start,
};

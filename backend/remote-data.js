const https = require("https");
const rp = require("request-promise");
const config = require("./config");
const localData = require("./local-data");
const utils = require("./utils");

/**
 * TODO: adding error handler
 */
async function combinedRemoteCalls() {
  const quotesLatestPath = await getContent(
    config.coinmarketcap.quotesLatestPath
  );

  const combinedResponse = handleCombinedResponse(quotesLatestPath);

  localData.updateData(combinedResponse);

  console.log("Got a response: Last Updated", combinedResponse.last_updated);
}

function handleCombinedResponse(response) {
  // console.log(response.data.quote.USD);
  return {
    total_market_cap_usd: response.data.quote.USD.total_market_cap,
    total_24h_volume_usd: response.data.quote.USD.total_volume_24h,
    bitcoin_percentage_of_market_cap: response.data.btc_dominance,
    ethereum_percentage_of_market_cap: response.data.eth_dominance,
    // active_markets: response.data.num_market_pairs,
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

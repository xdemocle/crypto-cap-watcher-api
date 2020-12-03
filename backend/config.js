// Options for db
const dbOpts = {
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-cap-watcher-db',
  decorate: true
};

const checkEachMinutes = 0.5;
const checkEachMinutesClient = 2.5;

const collections = {
  statistics: 'statistics',
  history: 'history'
};

const coinmarketcap = {
  hostname: 'pro-api.coinmarketcap.com',
  port: 443,
  apikey: process.env.CCC_API_KEY,
  globalPath: '/v1/cryptocurrency/listings/latest?start=1&limit=1&convert=USD',
  ethereumPath: '/v1/cryptocurrency/quotes/latest?slug=ethereum'
};

const timing = [5, 15, 30, 60, 180, 360, 540, 720, 1080, 1440, 2880, 4320,
  10080, 20160, 30240, 40320, 40320*1.5, 40320*2, 40320*2.5, 40320*3, 40320*6];

module.exports = {
  dbOpts,
  checkEachMinutes,
  checkEachMinutesClient,
  collections,
  coinmarketcap,
  timing
};

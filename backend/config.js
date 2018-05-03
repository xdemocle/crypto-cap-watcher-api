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

const coinmarketcapUrl = 'https://api.coinmarketcap.com/v2/global/';

const timing = [5, 15, 30, 60, 180, 360, 540, 720, 1080, 1440, 2880, 4320, 10080, 20160, 30240, 40320];

module.exports = {
  dbOpts,
  checkEachMinutes,
  checkEachMinutesClient,
  collections,
  coinmarketcapUrl,
  timing
};

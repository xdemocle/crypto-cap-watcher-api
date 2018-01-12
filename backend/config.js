// Options for db
const dbOpts = {
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-cap-watcher-db',
  decorate: true
};

const checkEachMinutes = 5;

const collections = {
  statistics: 'statistics',
  history: 'history'
};

const coinmarketcapUrl = 'https://api.coinmarketcap.com/v1/global/';

const timing = [5, 15, 30, 60, 180, 360, 720, 1440, 2880, 4320, 10080, 20160];

module.exports = {
  dbOpts,
  checkEachMinutes,
  collections,
  coinmarketcapUrl,
  timing
};

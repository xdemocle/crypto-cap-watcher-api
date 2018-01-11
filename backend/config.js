// Options for db
const dbOpts = {
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-cap-watcher-db',
  decorate: true
};

const checkEachMinutes = 5;

const collection = 'statistics';

const coinmarketcapUrl = 'https://api.coinmarketcap.com/v1/global/';

module.exports = {
  dbOpts,
  checkEachMinutes,
  collection,
  coinmarketcapUrl
};

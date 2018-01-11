const https = require('https');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const config = require('./config');

function makeSchema(response) {
  return {
    id: 1,
    last_updated: response.last_updated,
    total_market_cap: response.total_market_cap_usd,
    total_24h_volume: response.total_24h_volume_usd,
    bitcoin_percentage_of_market_cap: response.bitcoin_percentage_of_market_cap,
    active_currencies: response.active_currencies,
    active_assets: response.active_assets,
    active_markets: response.active_markets
  };
}

function findDocuments(db, response, callback) {
  // Get the documents collection
  const collection = db.collection(config.collection);

  // Find some documents
  collection.findOneAndUpdate(
    {
      id: 1
    },
    {
      $set: makeSchema(response)
    },
    {
      returnOriginal: false,
      // sort: [[a,1]],
      upsert: true
    }, (err) => {
      assert.equal(null, err);
      callback();
    }
  );
}

function updateCollection(response) {
  // Use connect method to connect to the server
  MongoClient.connect(config.dbOpts.url, (err, db) => {
    assert.equal(null, err);
    console.log('Connected successfully to server');

    findDocuments(db, response, () => {
      db.close();
    });
  });
}

module.exports = {
  updateCollection
};

const https = require('https');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const config = require('./config');
const utils = require('./utils');
const database = require('./database');

function makeSchema(response, histories) {
  return {
    id: 1,
    last_updated: response.last_updated,
    total_market_cap: response.total_market_cap_usd,
    total_24h_volume: response.total_24h_volume_usd,
    bitcoin_percentage: response.bitcoin_percentage_of_market_cap,
    active_currencies: response.active_currencies,
    active_assets: response.active_assets,
    active_markets: response.active_markets,
    history: makeHistoryWrapper(response, histories)
  };
}

function makeHistoryWrapper(response, histories) {

  let history = [];

  config.timing.forEach(element => {

    let newStat = {
      id: element,

      total_market_cap: response.total_market_cap_usd,
      total_market_cap_arrow: 'up',
      total_market_cap_perc: '30',

      total_24h_volume: response.total_24h_volume_usd,
      total_24h_volume_arrow: 'down',
      total_24h_volume_perc: '30',

      bitcoin_percentage: response.bitcoin_percentage_of_market_cap,
      bitcoin_percentage_arrow: 'down',
      bitcoin_percentage_perc: '30'
    }

    history.push(newStat);
  });

  return history;
}

function findDocumentAndUpdate(db, response, callback) {
  // Get the documents collection
  const collection = db.collection(config.collections.statistics);

  // Check if last_update item is already present
  collection.findOne({id: 1}, {}, (err, doc) => {
    assert.equal(null, err);

    if (!doc || (response.last_updated !== doc.last_updated)) {
      const action = doc ? 'updateOne' : 'insertOne';
      const callback = (err, dbAnswer) => {
        assert.equal(null, err);
        console.log('Statistics query executed:', dbAnswer.result);
      };

      getHistoryDocuments((histories) => {
        if (action === 'insertOne') {
          // Insert the stat document
          collection.insertOne(makeSchema(response, histories), callback);
        } else {
          // Update the stat document
          collection.updateOne({id: 1}, {$set: makeSchema(response, histories)},
            callback);
        }
      });
    } else {
      console.log('Statistics query NOT executed: last_updated is the most recent');
    }
  });
}

function saveNewHistoryDocument(db, response, callback) {
  // Get the documents collection
  const collection = db.collection(config.collections.history);

  // Check if last_update item is already present
  collection.findOne({last_updated: response.last_updated}, {}, (err, doc) => {
    assert.equal(null, err);

    if (!doc) {
      // Insert a document
      collection.insertOne(response, (err, dbAnswer) => {
        assert.equal(null, err);
        console.log('History query executed:', dbAnswer.result);
      });
    } else {
      console.log('History query NOT executed: last_updated already present');
    }
  });
}

function updateData(response) {
  // Use connect method to connect to the server
  database.connect((db) => {
    findDocumentAndUpdate(db, response);
    saveNewHistoryDocument(db, response);
  });
}

function getHistoryDocuments() {

}

module.exports = {
  updateData
};

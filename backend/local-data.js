const https = require('https');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const config = require('./config');

function makeLabel(element) {

  let chunks = ['Changes ('];

  if (element === 60) {
    chunks.push(1);
    chunks.push(' Hour)');
  } else if (element > 10080) {
    chunks.push(element / 60 / 24 / 7);
    chunks.push(' Weeks)');
  } else if (element > 1440) {
    chunks.push(element / 60 / 24);
    chunks.push(' Days)');
  } else if (element >= 120) {
    chunks.push(element / 60);
    chunks.push(' Hours)');
  } else {
    chunks.push(element);
    chunks.push(' Minutes)');
  }

  return chunks.join('');
}

function makeSchema(response) {
  const makeTimingLabels = () => {
    let timing = [];

    config.timing.forEach(element => {
      const item = {
        id: element,
        label: makeLabel(element),
        visible: element > 1440 ? false : true
      }

      timing.push(item);
    });

    return timing;
  }

  return {
    id: 1,
    last_updated: response.last_updated,
    total_market_cap: response.total_market_cap_usd,
    total_24h_volume: response.total_24h_volume_usd,
    bitcoin_percentage: response.bitcoin_percentage_of_market_cap,
    active_currencies: response.active_currencies,
    active_assets: response.active_assets,
    active_markets: response.active_markets,
    history: makeHistoryWrapper(response),
    config: {
      timing: makeTimingLabels()
    }
  };
}

function makeHistoryWrapper(response) {

  let history = [];

  config.timing.forEach(element => {

    let newStat = {
      id: element,
      label: makeLabel(element),

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

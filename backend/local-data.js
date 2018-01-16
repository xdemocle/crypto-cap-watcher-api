const https = require('https');
const MongoClient = require('mongodb').MongoClient;
const _ = require('lodash');
const assert = require('assert');
const Promise = require('promise');
const config = require('./config');
const utils = require('./utils');
const database = require('./database');

function makeSchema(response, callback) {
  return new Promise(function (resolve, reject) {
    makeHistoryWrapper(response).then((newHistoryWrapper) => {
      const mainObject = {
        id: 1,
        last_updated: response.last_updated,
        total_market_cap: response.total_market_cap_usd,
        total_24h_volume: response.total_24h_volume_usd,
        bitcoin_percentage: response.bitcoin_percentage_of_market_cap,
        active_currencies: response.active_currencies,
        active_assets: response.active_assets,
        active_markets: response.active_markets,
        history: newHistoryWrapper
      };

      resolve(mainObject);
    });
  });
}

function makeHistoryWrapper(response) {
  const history = [];

  return new Promise(function (resolve, reject) {

    const countTimings = config.timing.length;
    let pointer = 1;

    _.each(config.timing, (timing, index) => {

      getHistoryDocuments(response.last_updated, timing, (docs) => {

        const averages = calculateAverages(response, docs);

        // TODO: calculate averages
        let newStat = {
          id: timing,

          total_market_cap: averages.total_market_cap,
          total_market_cap_arrow: averages.total_market_cap_arrow,
          total_market_cap_perc: averages.total_market_cap_perc,

          total_24h_volume: averages.total_24h_volume,
          total_24h_volume_arrow: averages.total_24h_volume_arrow,
          total_24h_volume_perc: averages.total_24h_volume_perc,

          bitcoin_percentage: averages.bitcoin_percentage,
          bitcoin_percentage_arrow: averages.bitcoin_percentage_arrow,
          bitcoin_percentage_perc: averages.bitcoin_percentage_perc
        }

        history.push(newStat);

        if (pointer >= countTimings) {
          resolve(history);
        }

        pointer++;
      });
    });
  });
}

function calculateAverages(lastDoc, docsHistory) {

  let averages = {
    total_market_cap: 0,
    total_24h_volume: 0,
    bitcoin_percentage: 0
  };

  const countImports = docsHistory.length;

  _.each(docsHistory, (item) => {
    averages.total_market_cap += item.total_market_cap_usd;
    averages.total_24h_volume += item.total_24h_volume_usd;
    averages.bitcoin_percentage += item.bitcoin_percentage_of_market_cap;
  });

  averages.total_market_cap = averages.total_market_cap / countImports;
  averages.total_24h_volume = averages.total_24h_volume / countImports;
  averages.bitcoin_percentage = utils.roundNumber(averages.bitcoin_percentage / countImports, 3);

  // Calculate percentuals
  averages.total_market_cap_perc = utils.calculatePercetual(lastDoc.total_market_cap_usd, averages.total_market_cap, 3);
  averages.total_24h_volume_perc = utils.calculatePercetual(lastDoc.total_24h_volume_usd, averages.total_24h_volume, 3);
  averages.bitcoin_percentage_perc = utils.calculatePercetual(lastDoc.bitcoin_percentage_of_market_cap, averages.bitcoin_percentage, 2);

  // Calculate arrows
  averages.total_market_cap_arrow = utils.calculateArrow(lastDoc.total_market_cap_usd, averages.total_market_cap);
  averages.total_24h_volume_arrow = utils.calculateArrow(lastDoc.total_24h_volume_usd, averages.total_24h_volume);
  averages.bitcoin_percentage_arrow = utils.calculateArrow(lastDoc.bitcoin_percentage_of_market_cap, averages.bitcoin_percentage);

  return averages;
}

function findDocumentAndUpdate(db, response, callback) {
  // Get the documents collection
  const collection = db.collection(config.collections.statistics);

  // Check if last_update item is already present
  collection.findOne({id: 1}, {}, (err, doc) => {
    assert.equal(null, err);

    if (!doc || (response.last_updated !== doc.last_updated)) {
      const action = doc ? 'updateOne' : 'insertOne';
      const logCallback = (err, dbAnswer) => {
        assert.equal(null, err);
        console.log('Statistics query executed:', dbAnswer.result);
      };

      makeSchema(response).then((newObject) => {
        if (action === 'insertOne') {
          // Insert the stat document
          collection.insertOne(newObject, logCallback);
        } else {
          // Update the stat document
          collection.updateOne({id: 1}, {$set: newObject}, logCallback);
        }
        callback();
      });
    } else {
      callback();
      console.log('Statistics query NOT executed: last_updated is the most recent');
    }
  });
}

function saveNewHistoryDocument(db, response) {
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
    findDocumentAndUpdate(db, response, () => {
      saveNewHistoryDocument(db, response);
    });
  });
}

function getHistoryDocuments(last_updated, minutes, callback) {
  // Query for minutes ago (from now)
  const query = {
    last_updated: {
      $gte: last_updated - 60 * minutes
    }
  };

  const limit = minutes > 30 ? 2 : 1;

  // Use connect method to connect to the server
  database.connect((db) => {
    // Get the documents collection
    const collection = db.collection(config.collections.history);

    collection.find(query).limit(limit).toArray((err, docs) => {
      if (!docs.length && minutes === 5) {
        getHistoryLastDocument(collection, {limit: 1}, callback);
      } else {
        callback(docs);
      }
    });
  });
}

function getHistoryLastDocument(collection, options, callback) {
  collection.find().sort({_id:-1}).limit(options.limit).toArray((err, docs) => {
    callback(docs);
  });
}

module.exports = {
  updateData
};

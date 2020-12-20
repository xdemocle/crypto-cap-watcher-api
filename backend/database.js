const MongoClient = require("mongodb").MongoClient;
const config = require("./config");

var state = {
  db: null,
};

exports.connect = function (done) {
  // If we are already connected to MongoDB, we exec the callback directly
  if (state.db) {
    return done(state.db);
  }

  MongoClient.connect(config.dbOpts.url, function (err, db) {
    if (err) {
      console.log("Connection problems with MongoDB server", err);
      return null;
    }

    state.db = db.db("crypto-cap-watcher-db");
    console.log("Connected successfully to MongoDB server");
    done(db);

    process.on("SIGINT", () => {
      db.close();
      console.log("Connection with MongoDB closed after app shutdown");
    });
  });
};

exports.get = function () {
  return state.db;
};

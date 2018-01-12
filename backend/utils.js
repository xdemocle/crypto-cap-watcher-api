const pingSys = require('ping');
const config = require('./config');

const cfg = {
  timeout: 10,
  min_reply: 3
};

function ping(host, callback) {
  pingSys.sys.probe(host, function(isAlive){
    const msg = isAlive ? 'host ' + host + ' is alive' : 'host ' + host + ' is dead';

    console.log('Ping response:', msg);

    if (isAlive) {
      callback(isAlive);
    } else {
      setTimeout(() => {
        ping(host, callback);
      }, 5000);
    }
  }, cfg);
}

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

function makeTimingLabels() {
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

module.exports = {
  ping,
  makeLabel,
  makeTimingLabels
};

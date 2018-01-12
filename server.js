const Hapi = require('hapi');
const hapiMongodb = require('hapi-mongodb');
const Boom = require('boom');
const config = require('./backend/config');
const utils = require('./backend/utils');
const remoteData = require('./backend/remote-data');

// Create a server with a host and port
const server = Hapi.server({
  host: '0.0.0.0',
  port: process.env.PORT || 5000,
  routes: {
    cors: true
  }
});

// Load plugins and start server
async function start() {
  await server.register({
    plugin: hapiMongodb,
    options: config.dbOpts
  });

  try {
    await server.start();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }

  console.log('Backend API running at:', server.info.uri);

  try {
    await remoteData.start();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

start();

// Add the statistics route
server.route({
  method: 'GET',
  path: '/statistics',
  async handler(request) {
    const db = request.mongo.db;
    const collection = config.collections.statistics;

    try {
      const result = await db.collection(collection).findOne({ id: 1 });
      return result || { message: 'no statistics available' };
    } catch (err) {
      throw Boom.internal('Internal MongoDB error', err);
    }
  }
});

// Add the app config route
server.route({
  method: 'GET',
  path: '/settings',
  async handler() {
    return {
      checkEachMinutes: config.checkEachMinutes,
      timing: utils.makeTimingLabels()
    };
  }
});

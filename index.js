const Hapi = require('hapi');
const hapiMongodb = require('hapi-mongodb');
const Boom = require('boom');
const config = require('./backend/config');
const remoteData = require('./backend/remote-data');

// Create a server with a host and port
const server = Hapi.server({
  host: 'localhost',
  port: 5000,
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

// Add the route
server.route({
  method: 'GET',
  path: `/${config.collection}`,
  async handler(request) {
    const db = request.mongo.db;

    try {
      const result = await db.collection(config.collection).findOne({ id: 1 });
      return result || { message: 'no statistics available' };
    } catch (err) {
      throw Boom.internal('Internal MongoDB error', err);
    }
  }
});

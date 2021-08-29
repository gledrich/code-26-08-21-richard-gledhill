const { before, after } = require('mocha');
const { server } = require('../../src/container');

before(() => {
  global.app = server.start();
});

after(() => {
  server.stop();
});

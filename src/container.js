const { createContainer, asFunction, asValue } = require('awilix');
const express = require('express');
const logger = require('pino')();

const server = require('./server');

const container = createContainer();

container.register({
  app: asFunction(express).singleton(),
  server: asFunction(server).singleton(),
  logger: asValue(logger),
});

module.exports = container.cradle;

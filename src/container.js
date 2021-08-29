const { createContainer, asFunction, asValue } = require('awilix');
const express = require('express');
const logger = require('pino')();
const fs = require('fs');

const server = require('./server');

const bmiCalculator = require('./services/bmiCalculator');

const container = createContainer();

container.register({
  app: asFunction(express).singleton(),
  server: asFunction(server).singleton(),
  logger: asValue(logger),
  fs: asValue(fs),
});

container.register({
  bmiCalculator: asFunction(bmiCalculator),
});

module.exports = container.cradle;

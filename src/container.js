const { createContainer, asFunction, asValue } = require('awilix');
const express = require('express');
const logger = require('pino')();
const fs = require('fs');

const server = require('./server');

const healthController = require('./controllers/health');
const bmiCalculatorController = require('./controllers/bmiCalculator');
const controllers = require('./controllers');

const bmiCalculatorService = require('./services/bmiCalculator');

const container = createContainer();

// App
container.register({
  app: asFunction(express).singleton(),
  server: asFunction(server).singleton(),
});

// Utils
container.register({
  logger: asValue(logger),
  fs: asValue(fs),
});

// Services
container.register({
  bmiCalculatorService: asFunction(bmiCalculatorService),
});

// Controllers
container.register({
  controllers: asFunction(controllers),
  healthController: asValue(healthController),
  bmiCalculatorController: asFunction(bmiCalculatorController),
});

module.exports = container.cradle;

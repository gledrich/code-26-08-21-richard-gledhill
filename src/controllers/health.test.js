const { stub } = require('sinon');
const healthController = require('./health');

describe('health', () => {
  let responseStub;

  beforeEach(() => {
    responseStub = {
      status: stub().returnsThis(),
      json: stub(),
    };
  });

  describe('readiness', () => {
    it('sends a 200 status', () => {
      healthController.readiness({}, responseStub);

      return expect(responseStub.status).to.have.been.calledWithExactly(200);
    });

    it('sends some json', () => {
      healthController.readiness({}, responseStub);

      return expect(responseStub.json).to.have.been.calledWithExactly({ ping: 'pong' });
    });
  });

  describe('liveness', () => {
    it('sends a 200 status', () => {
      healthController.liveness({}, responseStub);

      return expect(responseStub.status).to.have.been.calledWithExactly(200);
    });

    it('sends some json', () => {
      healthController.liveness({}, responseStub);

      return expect(responseStub.json).to.have.been.calledWithExactly({ ping: 'pong' });
    });
  });
});

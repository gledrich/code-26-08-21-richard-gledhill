const { expect } = require('chai');
const { stub } = require('sinon');
const bmiCalculatorControllerFactory = require('./bmiCalculator');

describe('bmiCalculator', () => {
  const setup = () => {
    const dependencies = {
      bmiCalculatorService: {
        calculate: stub(),
      },
      fs: {
        createReadStream: stub(),
        pipe: stub(),
      },
      logger: {
        error: stub(),
      },
    };

    return {
      bmiCalculatorController: bmiCalculatorControllerFactory(dependencies),
      dependencies,
    };
  };

  describe('calculate', () => {
    it('triggers the bmi calculator', async () => {
      const { bmiCalculatorController, dependencies } = setup();
      const responseStub = {
        status: stub(),
      };

      dependencies.fs.createReadStream.returnsThis();

      await bmiCalculatorController.calculate({}, responseStub);

      return expect(dependencies.bmiCalculatorService.calculate).to.have.been.calledOnce;
    });

    it('streams the output data back to the client', async () => {
      const { bmiCalculatorController, dependencies } = setup();
      const responseStub = {
        status: stub(),
      };

      dependencies.fs.createReadStream
        .withArgs(`${__dirname}/../../data/output.json`).returnsThis();

      await bmiCalculatorController.calculate({}, responseStub);

      return expect(dependencies.fs.pipe).to.have.been.calledWithExactly(responseStub);
    });

    it('returns a 200 status', async () => {
      const { bmiCalculatorController, dependencies } = setup();
      const responseStub = {
        status: stub(),
      };

      dependencies.fs.createReadStream.returnsThis();

      await bmiCalculatorController.calculate({}, responseStub);

      return expect(responseStub.status).to.have.been.calledWithExactly(200);
    });

    describe('when calculating the BMI data rejects with an error', () => {
      it('sends a 500 status', async () => {
        const { bmiCalculatorController, dependencies } = setup();
        const responseStub = {
          sendStatus: stub(),
        };

        dependencies.bmiCalculatorService.calculate.rejects(new Error());

        await bmiCalculatorController.calculate({}, responseStub);

        return expect(responseStub.sendStatus).to.have.been.calledWithExactly(500);
      });

      it('logs the error', async () => {
        const { bmiCalculatorController, dependencies } = setup();
        const responseStub = {
          sendStatus: stub(),
        };
        const expectedError = new Error('expected');

        dependencies.bmiCalculatorService.calculate.rejects(expectedError);

        await bmiCalculatorController.calculate({}, responseStub);

        return expect(dependencies.logger.error).to.have.been.calledWith({ err: expectedError }, 'Encountered an error responding to request');
      });
    });

    describe('when streaming the output data throws an error', () => {
      describe('creating the read stream', () => {
        it('sends a 500 status', async () => {
          const { bmiCalculatorController, dependencies } = setup();
          const responseStub = {
            sendStatus: stub(),
          };

          dependencies.fs.createReadStream.throws(new Error());

          await bmiCalculatorController.calculate({}, responseStub);

          return expect(responseStub.sendStatus).to.have.been.calledWithExactly(500);
        });

        it('logs the error', async () => {
          const { bmiCalculatorController, dependencies } = setup();
          const responseStub = {
            sendStatus: stub(),
          };
          const expectedError = new Error('expected');

          dependencies.fs.createReadStream.throws(expectedError);

          await bmiCalculatorController.calculate({}, responseStub);

          return expect(dependencies.logger.error).to.have.been.calledWith({ err: expectedError }, 'Encountered an error responding to request');
        });
      });

      describe('piping the data', () => {
        it('sends a 500 status', async () => {
          const { bmiCalculatorController, dependencies } = setup();
          const responseStub = {
            sendStatus: stub(),
          };

          dependencies.fs.createReadStream.returnsThis();
          dependencies.fs.pipe.throws(new Error());

          await bmiCalculatorController.calculate({}, responseStub);

          return expect(responseStub.sendStatus).to.have.been.calledWithExactly(500);
        });

        it('logs the error', async () => {
          const { bmiCalculatorController, dependencies } = setup();
          const responseStub = {
            sendStatus: stub(),
          };
          const expectedError = new Error('expected');

          dependencies.fs.createReadStream.returnsThis();
          dependencies.fs.pipe.throws(expectedError);

          await bmiCalculatorController.calculate({}, responseStub);

          return expect(dependencies.logger.error).to.have.been.calledWith({ err: expectedError }, 'Encountered an error responding to request');
        });
      });
    });
  });
});

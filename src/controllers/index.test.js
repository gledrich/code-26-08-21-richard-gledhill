const { stub } = require('sinon');
const factory = require('./index');

describe('controllers', () => {
  const setup = () => {
    const dependencies = {
      app: {
        use: stub(),
      },
      healthController: {
        readiness: 'readiness',
        liveness: 'liveness',
      },
      bmiCalculatorController: {
        calculate: 'calculate',
      },
    };

    return {
      controllers: factory(dependencies),
      dependencies,
    };
  };

  describe('init', () => {
    it('intialises the health controllers', () => {
      const { controllers, dependencies } = setup();

      controllers.init();

      expect(dependencies.app.use).to
        .have.been.calledWithExactly('/readiness', dependencies.healthController.readiness);
      expect(dependencies.app.use).to
        .have.been.calledWithExactly('/liveness', dependencies.healthController.liveness);
    });

    it('initialises the bmi-calculator controllers', () => {
      const { controllers, dependencies } = setup();

      controllers.init();

      expect(dependencies.app.use).to
        .have.been.calledWithExactly('/bmi-calculator/calculate', dependencies.bmiCalculatorController.calculate);
    });
  });
});

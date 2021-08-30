module.exports = ({ app, healthController, bmiCalculatorController }) => ({
  init: () => {
    app.use('/readiness', healthController.readiness);
    app.use('/liveness', healthController.liveness);
    app.use('/bmi-calculator/calculate', bmiCalculatorController.calculate);
  },
});

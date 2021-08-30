module.exports = ({ bmiCalculatorService, fs, logger }) => ({
  calculate: async (req, res) => {
    try {
      await bmiCalculatorService.calculate();

      fs.createReadStream(`${__dirname}/../../data/output.json`).pipe(res);

      return res.status(200);
    } catch (err) {
      logger.error({ err }, 'Encountered an error responding to request');
      return res.sendStatus(500);
    }
  },
});

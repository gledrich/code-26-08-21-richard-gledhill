module.exports = ({ app, healthController }) => ({
  init: () => {
    app.use('/readiness', healthController.readiness);
    app.use('/liveness', healthController.liveness);
  },
});

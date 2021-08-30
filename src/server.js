module.exports = ({ app, logger, controllers }) => {
  let server;

  return ({
    start: () => {
      try {
        const port = process.env.PORT || 3000;
        // Initialise controllers
        controllers.init();

        // Start the server
        server = app.listen(port, () => {
          logger.info(`Server running on port: ${port}`);
        });
      } catch (err) {
        logger.error({ err }, 'Server failed to start');
        process.exit(1);
      }

      return server;
    },

    stop: () => {
      if (!server) {
        throw new Error('Could not stop server as it is not running');
      }

      try {
        server.close(() => {
          logger.info('Successfully shutdown server');
        });
      } catch (err) {
        logger.error({ err }, 'Server failed to gracefully shutdown');
        process.exit(1);
      }
    },
  });
};

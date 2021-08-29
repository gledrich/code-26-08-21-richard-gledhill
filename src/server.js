module.exports = ({ app, logger, controllers }) => {
  let server;

  return ({
    start: () => {
      try {
        // Initialise controllers
        controllers.init();

        // Start the server
        server = app.listen(process.env.PORT || 3000, () => {
          logger.info('Server running on localhost:3000');
        });
      } catch (err) {
        process.exit(1);
      }
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
        process.exit(1);
      }
    },
  });
};

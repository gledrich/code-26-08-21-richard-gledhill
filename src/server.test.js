const serverFactory = require('./server');

const { stub } = sinon;

describe('server', () => {
  const setup = () => {
    const dependencies = {
      app: {
        listen: stub(),
      },
      logger: {
        info: stub(),
      },
      controllers: {
        init: stub(),
      },
    };

    return {
      server: serverFactory(dependencies),
      dependencies,
    };
  };

  before(() => {
    stub(process, 'exit');
  });

  after(() => {
    process.exit.restore();
  });

  describe('start', () => {
    it('starts the server', () => {
      const { server, dependencies } = setup();

      server.start();

      return expect(dependencies.app.listen).to.have.been.called;
    });

    describe('when process.env.PORT is set', () => {
      const port = '1234';
      before(() => {
        process.env.PORT = port;
      });

      after(() => {
        process.env.PORT = '';
      });

      it('listens on process.env.PORT', () => {
        const { server, dependencies } = setup();

        server.start();

        return expect(dependencies.app.listen).to.have.been.calledWith(port);
      });
    });

    describe('when process.env.PORT is not set', () => {
      it('listens on 3000', () => {
        const { server, dependencies } = setup();

        server.start();

        return expect(dependencies.app.listen).to.have.been.calledWith(3000);
      });
    });

    it('logs a message', () => {
      const { server, dependencies } = setup();

      dependencies.app.listen.yields();

      server.start();

      return expect(dependencies.logger.info).to.have.been.calledWithExactly(`Server running on port: ${3000}`);
    });

    it('initialises the controllers', () => {
      const { server, dependencies } = setup();

      server.start();

      return expect(dependencies.controllers.init).to.have.been.calledOnce;
    });

    it('returns the created server', () => {
      const { server, dependencies } = setup();
      const expected = 'server';

      dependencies.app.listen.returns(expected);

      return expect(server.start()).to.eql(expected);
    });

    describe('when starting the server throws an error', () => {
      it('exits the process', () => {
        const { server, dependencies } = setup();

        dependencies.app.listen.throws(new Error());

        server.start();

        expect(process.exit).to.have.been.calledWithExactly(1);
      });
    });
  });

  describe('stop', () => {
    it('stops the server', () => {
      const { server, dependencies } = setup();
      const returnedServer = { close: stub() };

      dependencies.app.listen.returns(returnedServer);

      server.start();
      server.stop();

      return expect(returnedServer.close).to.have.been.calledOnce;
    });

    it('logs a message', () => {
      const { server, dependencies } = setup();

      dependencies.app.listen.returns({ close: stub().yields() });

      server.start();
      server.stop();

      return expect(dependencies.logger.info).to.have.been.calledWithExactly('Successfully shutdown server');
    });

    describe('when the server is not running', () => {
      it('throws an error', () => {
        const { server } = setup();

        return expect(() => server.stop()).to.throw('Could not stop server as it is not running');
      });
    });

    describe('when stopping the server throws an error', () => {
      it('exits the process', () => {
        const { server, dependencies } = setup();

        dependencies.app.listen.returns({
          close: stub().throws(new Error()),
        });

        server.start();
        server.stop();

        return expect(process.exit).to.have.been.calledWithExactly(1);
      });
    });
  });
});

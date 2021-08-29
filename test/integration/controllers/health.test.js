const { expect } = require('chai');
const request = require('supertest');

describe('health controllers', () => {
  ['liveness', 'readiness'].forEach((path) => {
    describe(path, () => {
      it('returns a 200', () => {
        request(global.app)
          .get(`/${path}`)
          .expect(200)
          .then(({ body }) => expect(body).to.eql({ ping: 'pong' }));
      });
    });
  });
});

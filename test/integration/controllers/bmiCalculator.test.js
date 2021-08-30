const { expect } = require('chai');
const request = require('supertest');
const fs = require('fs');
const proxyquire = require('proxyquire').noCallThru();
const { ranges: bmiRanges, calculateBMIKgMetersSquared, getBMICategory } = require('../../utils/bmi');

const inputData = JSON.parse(fs.readFileSync(`${__dirname}/../../../data/input.json`, { encoding: 'utf8' }));

describe('/bmi-calculator', () => {
  describe('/calculate', () => {
    it('returns a 200 and the correct output data', () => request(global.app)
      .get('/bmi-calculator/calculate')
      .expect(200)
      .then(({ text }) => {
        expect(() => JSON.parse(text)).not.to.throw();
        JSON.parse(text).forEach((person, i) => expect(person).to.eql({
          ...inputData[i],
          BMI: inputData[i].WeightKg / (inputData[i].HeightCm / 100),
          BMICategory: getBMICategory(
            calculateBMIKgMetersSquared(inputData[i].WeightKg, inputData[i].HeightCm),
          ),
          HealthRisk: bmiRanges[
            getBMICategory(
              calculateBMIKgMetersSquared(inputData[i].WeightKg, inputData[i].HeightCm),
            )
          ].healthRisk,
        }));
      }));

    describe('when an error occurs calculating the bmi data', () => {
      const { server } = proxyquire('../../../src/container', {
        './services/bmiCalculator': () => ({
          calculate: () => { throw new Error(); },
        }),
      });

      before(() => {
        process.env.PORT = 1234;
      });

      after(() => {
        process.env.PORT = '';
        server.stop();
      });

      it('returns a 500 status', () => request(server.start())
        .get('/bmi-calculator/calculate')
        .expect(500));
    });

    describe('when an error occurs piping the output data', () => {
      const { server } = proxyquire('../../../src/container', {
        fs: {
          ...fs,
          createReadStream: (arg) => {
            const badStream = fs.createReadStream(arg);

            badStream.pipe = () => { throw new Error(); };

            return badStream;
          },
        },
      });

      before(() => {
        process.env.PORT = 1234;
      });

      after(() => {
        process.env.PORT = '';
        server.stop();
      });

      it('returns a 500 status', () => request(server.start())
        .get('/bmi-calculator/calculate')
        .expect(500));
    });
  });
});

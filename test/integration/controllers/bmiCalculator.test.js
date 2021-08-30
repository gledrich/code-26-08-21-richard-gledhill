const { expect } = require('chai');
const request = require('supertest');
const fs = require('fs');
const { calculateBMIKgMetersSquared, getBMICategory } = require('../../utils/bmi');

const inputData = JSON.parse(fs.readFileSync(`${__dirname}/../../../data/input.json`, { encoding: 'utf8' }));

describe('/bmi-calculator', () => {
  describe('/calculate', () => {
    it('returns a 200 and the correct output data', () => {
      request(global.app)
        .get('/calculate')
        .expect(200)
        .then(({ body }) => {
          expect(() => JSON.parse(body)).not.to.throw();
          JSON.parse(body).forEach((person, i) => expect(person).to.eql({
            ...inputData[i],
            BMI: inputData[i].WeightKg / (inputData[i].HeightCm / 100),
            BMICategory: getBMICategory(
              calculateBMIKgMetersSquared(inputData[i].WeightKg, inputData[i].HeightCm),
            ),
          }));
        });
    });
  });
});

const { expect } = require('chai');
const fs = require('fs');
const { bmiCalculator } = require('../../../src/container');
const { calculateBMIKgMetersSquared, getBMICategory } = require('../../utils/bmi');

const inputData = JSON.parse(fs.readFileSync(`${__dirname}/../../../data/input.json`, { encoding: 'utf8' }));

describe('bmiCalculator', () => {
  const outputFile = `${__dirname}/test-output.json`;

  afterEach(async () => {
    // clean up test output file
    await fs.unlinkSync(outputFile);
  });

  it('calculates BMI data of the correct input file and writes it to an output file', async () => {
    // make sure there's no file there
    if (fs.existsSync(outputFile)) {
      await fs.unlinkSync(outputFile);
    }

    await bmiCalculator.calculate(outputFile);

    const outputData = fs.readFileSync(outputFile, { encoding: 'utf8' });

    expect(() => JSON.parse(outputData)).not.to.throw();
    JSON.parse(outputData).forEach((person, i) => expect(person).to.eql({
      ...inputData[i],
      BMI: inputData[i].WeightKg / (inputData[i].HeightCm / 100),
      BMICategory: getBMICategory(
        calculateBMIKgMetersSquared(inputData[i].WeightKg, inputData[i].HeightCm),
      ),
    }));
  });
});

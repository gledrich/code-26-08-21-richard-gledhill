const { expect } = require('chai');
const fs = require('fs');
const proxyquire = require('proxyquire');
const { Readable } = require('stream');
const { bmiCalculatorService } = require('../../../src/container');
const { ranges: bmiRanges, calculateBMIKgMetersSquared, getBMICategory } = require('../../utils/bmi');

const inputData = JSON.parse(fs.readFileSync(`${__dirname}/../../../data/input.json`, { encoding: 'utf8' }));

describe('bmiCalculatorService', () => {
  const outputFile = `${__dirname}/test-output.json`;

  afterEach(async () => {
    // clean up test output file
    if (fs.existsSync(outputFile)) {
      await fs.unlinkSync(outputFile);
    }
  });

  it('calculates BMI data of the correct input file and writes it to an output file', async () => {
    // make sure there's no file there
    if (fs.existsSync(outputFile)) {
      await fs.unlinkSync(outputFile);
    }

    await bmiCalculatorService.calculate(outputFile);

    const outputData = fs.readFileSync(outputFile, { encoding: 'utf8' });

    expect(() => JSON.parse(outputData)).not.to.throw();
    JSON.parse(outputData).forEach((person, i) => expect(person).to.eql({
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
  });

  describe('when an error occurs reading the data', () => {
    const { bmiCalculatorService: badBmiCalculatorService } = proxyquire('../../../src/container', {
      fs: {
        createReadStream: () => { throw new Error(); },
      },
    });

    before(() => {
      process.env.PORT = 1234;
    });

    after(() => {
      process.env.PORT = '';
    });

    it('rejects with an error', () => {
      expect(badBmiCalculatorService.calculate(outputFile)).to
        .eventually.be.rejectedWith(Error, 'Unable to process BMI data');
    });
  });

  describe('when an error occurs writing the data', () => {
    const { bmiCalculatorService: badBmiCalculatorService } = proxyquire('../../../src/container', {
      fs: {
        createWriteStream: () => { throw new Error(); },
      },
    });

    before(() => {
      process.env.PORT = 1234;
    });

    after(() => {
      process.env.PORT = '';
    });

    it('rejects with an error', () => {
      expect(badBmiCalculatorService.calculate(outputFile)).to
        .eventually.be.rejectedWith(Error, 'Unable to process BMI data');
    });
  });

  describe('when the data contains bad data', () => {
    const badData = '{ invalid }';
    const otherData = [{
      Gender: 'Male',
      HeightCm: 171,
      WeightKg: 96,
    },
    {
      Gender: 'Male',
      HeightCm: 161,
      WeightKg: 85,
    }];

    const { bmiCalculatorService: badBmiCalculatorService } = proxyquire('../../../src/container', {
      fs: {
        createReadStream: () => Readable.from([
          JSON.stringify(otherData.slice(0, otherData.length / 2)),
          badData,
          JSON.stringify(otherData.slice(otherData.length / 2)),
        ]),
      },
    });

    it('continues processing', async () => {
      await badBmiCalculatorService.calculate(outputFile);

      const outputData = fs.readFileSync(outputFile, { encoding: 'utf8' });

      expect(() => JSON.parse(outputData)).not.to.throw();
      JSON.parse(outputData).forEach((person, i) => expect(person).to.eql({
        ...otherData[i],
        BMI: otherData[i].WeightKg / (otherData[i].HeightCm / 100),
        BMICategory: getBMICategory(
          calculateBMIKgMetersSquared(otherData[i].WeightKg, otherData[i].HeightCm),
        ),
        HealthRisk: bmiRanges[
          getBMICategory(
            calculateBMIKgMetersSquared(otherData[i].WeightKg, otherData[i].HeightCm),
          )
        ].healthRisk,
      }));
    });
  });
});

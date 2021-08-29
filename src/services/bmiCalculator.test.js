const { stub } = require('sinon');
const { Readable } = require('stream');
const bmiCalculatorFactory = require('./bmiCalculator');

const inputData = [
  {
    Gender: 'Male',
    HeightCm: 171,
    WeightKg: 96,
  },
  {
    Gender: 'Male',
    HeightCm: 185,
    WeightKg: 60,
  },
  {
    Gender: 'Female',
    HeightCm: 167,
    WeightKg: 82,
  },
  {
    Gender: 'Female',
    HeightCm: 185,
    WeightKg: 140,
  },
];
const bmiRanges = {
  Underweight: { max: 18.4 },
  Normal: { min: 18.5, max: 24.9 },
  Overweight: { min: 25, max: 29.9 },
  'Moderately Obese': { min: 30, max: 34.9 },
  'Severely Obese': { min: 35, max: 39.9 },
  'Very Severely Obese': { min: 40 },
};
const calculateBMIKgMetersSquared = (m, h) => m / ((h / 100) ** 2);
const getBMICategory = (bmiInKgMetersSquared) => {
  let category = 'Unknown';

  Object.keys(bmiRanges).forEach((key) => {
    const range = bmiRanges[key];

    if (range.max && range.min
      && bmiInKgMetersSquared >= range.min
      && bmiInKgMetersSquared <= range.max) {
      category = key;
    } if (range.min && !range.max && bmiInKgMetersSquared > range.min) {
      category = key;
    } if (range.max && !range.min && bmiInKgMetersSquared < range.max) {
      category = key;
    }
  });

  return category;
};

describe('bmiCalculator', () => {
  const setup = () => {
    const dependencies = {
      fs: {
        createReadStream: stub(),
        createWriteStream: stub(),
      },
      logger: {
        info: () => { },
        debug: () => { },
        warn: () => { },
        error: () => { },
      },
    };

    return {
      bmiCalculator: bmiCalculatorFactory(dependencies),
      dependencies,
      inputStream: Readable.from([JSON.stringify(inputData)]),
    };
  };

  describe('calculate', () => {
    it('reads the input data from the correct location', async () => {
      const { bmiCalculator, dependencies, inputStream } = setup();

      dependencies.fs.createReadStream.returns(inputStream);
      dependencies.fs.createWriteStream.returns({
        write: stub(),
      });

      await bmiCalculator.calculate();

      return expect(dependencies.fs.createReadStream).to
        .have.been.calledWith(`${__dirname}/../../data/input.json`);
    });

    it('appends the BMI of each person to the data', async () => {
      const { bmiCalculator, dependencies, inputStream } = setup();
      const writeStub = stub();

      dependencies.fs.createReadStream.returns(inputStream);
      dependencies.fs.createWriteStream.withArgs(`${__dirname}/../../data/output.json`).returns({
        write: writeStub,
      });

      await bmiCalculator.calculate();

      inputData.forEach((item, i) => {
        expect(writeStub.args[i + 1][0]).to
          .contain(`"BMI": ${item.WeightKg / (item.HeightCm / 100)}`);
      });
    });

    it('appends the BMICategory of each person to the data', async () => {
      const { bmiCalculator, dependencies, inputStream } = setup();
      const writeStub = stub();

      dependencies.fs.createReadStream.returns(inputStream);
      dependencies.fs.createWriteStream.withArgs(`${__dirname}/../../data/output.json`).returns({
        write: writeStub,
      });

      await bmiCalculator.calculate();

      inputData.forEach((item, i) => {
        expect(writeStub.args[i + 1][0]).to
          .contain(`"BMICategory": "${getBMICategory(calculateBMIKgMetersSquared(item.WeightKg, item.HeightCm))}"`);
      });
    });

    it('writes the data to the correct file', async () => {
      const { bmiCalculator, dependencies, inputStream } = setup();
      const writeStub = stub();

      dependencies.fs.createReadStream.returns(inputStream);
      dependencies.fs.createWriteStream.returns({
        write: writeStub,
      });

      await bmiCalculator.calculate();

      return expect(dependencies.fs.createWriteStream).to
        .have.been.calledWithExactly(`${__dirname}/../../data/output.json`);
    });

    it('writes parseable JSON data', async () => {
      const { bmiCalculator, dependencies, inputStream } = setup();
      const writeStub = stub();

      dependencies.fs.createReadStream.returns(inputStream);
      dependencies.fs.createWriteStream.returns({
        write: writeStub,
      });

      await bmiCalculator.calculate();

      let writtenData = '';
      writeStub.args.forEach((arg) => {
        writtenData += arg[0];
      });

      return expect(() => JSON.parse(writtenData)).to.not.throw();
    });

    it('parses multiple chunks of data', async () => {
      const { bmiCalculator, dependencies } = setup();
      const writeStub = stub();

      dependencies.fs.createReadStream.returns(Readable.from([
        JSON.stringify(inputData.slice(0, inputData.length / 2)),
        JSON.stringify(inputData.slice(inputData.length / 2)),
      ]));
      dependencies.fs.createWriteStream.returns({
        write: writeStub,
      });

      await bmiCalculator.calculate();

      inputData.forEach((item, i) => expect(writeStub.args[i + 1][0]).to
        .contain(JSON.stringify({
          ...item,
          BMI: item.WeightKg / (item.HeightCm / 100),
          BMICategory: getBMICategory(
            calculateBMIKgMetersSquared(item.WeightKg, item.HeightCm),
          ),
        }, null, 2)));
    });

    describe('when streaming the data throws an error', () => {
      it('rejects with an error', () => {
        const { bmiCalculator, dependencies } = setup();

        dependencies.fs.createReadStream.throws(new Error());

        return expect(bmiCalculator.calculate()).to
          .eventually.be.rejectedWith(Error, 'Unable to process BMI data');
      });
    });

    describe('when writing the data throws an error', () => {
      it('rejects with an error', () => {
        const { bmiCalculator, dependencies } = setup();

        dependencies.fs.createWriteStream.throws(new Error());

        return expect(bmiCalculator.calculate()).to
          .eventually.be.rejectedWith(Error, 'Unable to process BMI data');
      });
    });

    describe('when the data contains invalid JSON', () => {
      it('continues processing other items', async () => {
        const { bmiCalculator, dependencies } = setup();
        const writeStub = stub();
        const invalidData = '{ invalid }';

        dependencies.fs.createReadStream.returns(
          Readable.from([
            JSON.stringify(inputData.slice(0, 1)),
            invalidData,
            JSON.stringify(inputData.slice(1)),
          ]),
        );
        dependencies.fs.createWriteStream.withArgs(`${__dirname}/../../data/output.json`).returns({
          write: writeStub,
        });

        await bmiCalculator.calculate();

        expect(writeStub).not.to.have.been.calledWith(invalidData);
        inputData.forEach((input, i) => expect(writeStub.args[i + 1][0]).to.contain(JSON.stringify({
          ...input,
          BMI: input.WeightKg / (input.HeightCm / 100),
          BMICategory: getBMICategory(
            calculateBMIKgMetersSquared(input.WeightKg, input.HeightCm),
          ),
        }, null, 2)));
      });
    });
  });
});

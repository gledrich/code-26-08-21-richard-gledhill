/* eslint-disable no-unused-expressions */
const { stub } = require('sinon');
const { Readable } = require('stream');
const util = require('util');
const bmiCalculatorServiceFactory = require('./bmiCalculator');
const { ranges: bmiRanges, calculateBMIKgMetersSquared, getBMICategory } = require('../../test/utils/bmi');

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

describe('bmiCalculatorService', () => {
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
      bmiCalculatorService: bmiCalculatorServiceFactory(dependencies),
      dependencies,
      inputStream: Readable.from([JSON.stringify(inputData)]),
    };
  };

  describe('calculate', () => {
    it('reads the input data from the correct location', async () => {
      const { bmiCalculatorService, dependencies, inputStream } = setup();

      dependencies.fs.createReadStream.returns(inputStream);
      dependencies.fs.createWriteStream.returns(
        { write: stub(), end: stub(), on: stub().yields() },
      );

      await bmiCalculatorService.calculate();

      return expect(dependencies.fs.createReadStream).to
        .have.been.calledWith(`${__dirname}/../../data/input.json`);
    });

    it('appends the BMI of each person to the data', async () => {
      const { bmiCalculatorService, dependencies, inputStream } = setup();
      const writeStub = { write: stub(), end: stub(), on: stub().yields() };

      dependencies.fs.createReadStream.returns(inputStream);
      dependencies.fs.createWriteStream.withArgs(`${__dirname}/../../data/output.json`).returns(writeStub);

      await bmiCalculatorService.calculate();

      inputData.forEach((item, i) => {
        expect(writeStub.write.args[i + 1][0]).to
          .contain(`"BMI": ${item.WeightKg / (item.HeightCm / 100)}`);
      });
    });

    it('appends the Health Risk of each person to the data', async () => {
      const { bmiCalculatorService, dependencies, inputStream } = setup();
      const writeStub = { write: stub(), end: stub(), on: stub().yields() };

      dependencies.fs.createReadStream.returns(inputStream);
      dependencies.fs.createWriteStream.withArgs(`${__dirname}/../../data/output.json`).returns(writeStub);

      await bmiCalculatorService.calculate();

      inputData.forEach((item, i) => {
        expect(writeStub.write.args[i + 1][0]).to
          .contain(`"HealthRisk": "${bmiRanges[getBMICategory(calculateBMIKgMetersSquared(item.WeightKg, item.HeightCm))].healthRisk}"`);
      });
    });

    it('appends the BMICategory of each person to the data', async () => {
      const { bmiCalculatorService, dependencies, inputStream } = setup();
      const writeStub = { write: stub(), end: stub(), on: stub().yields() };

      dependencies.fs.createReadStream.returns(inputStream);
      dependencies.fs.createWriteStream.withArgs(`${__dirname}/../../data/output.json`).returns(writeStub);

      await bmiCalculatorService.calculate();

      inputData.forEach((item, i) => {
        expect(writeStub.write.args[i + 1][0]).to
          .contain(`"BMICategory": "${getBMICategory(calculateBMIKgMetersSquared(item.WeightKg, item.HeightCm))}"`);
      });
    });

    it('writes the data to the given file', async () => {
      const { bmiCalculatorService, dependencies, inputStream } = setup();
      const outputFile = '/some-directory/output.json';

      dependencies.fs.createReadStream.returns(inputStream);
      dependencies.fs.createWriteStream.returns(
        { write: stub(), end: stub(), on: stub().yields() },
      );

      await bmiCalculatorService.calculate(outputFile);

      return expect(dependencies.fs.createWriteStream).to
        .have.been.calledWithExactly(outputFile);
    });

    it('ends the write stream', async () => {
      const { bmiCalculatorService, dependencies, inputStream } = setup();
      const writeStub = { write: stub(), end: stub(), on: stub().yields() };

      dependencies.fs.createReadStream.returns(inputStream);
      dependencies.fs.createWriteStream.returns(writeStub);

      await bmiCalculatorService.calculate();

      return expect(writeStub.end).to
        .have.been.calledOnce;
    });

    it('resolves once the write stream has ended', async () => {
      const { bmiCalculatorService, dependencies, inputStream } = setup();
      const writeStub = { write: stub(), end: stub(), on: stub() };

      dependencies.fs.createReadStream.returns(inputStream);
      dependencies.fs.createWriteStream.returns(writeStub);

      const prom = bmiCalculatorService.calculate();

      expect(util.inspect(prom).includes('pending')).to.be.true;

      writeStub.on.withArgs('finish').yields();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(util.inspect(prom).includes('pending')).to.be.false;
    });

    it('writes parseable JSON data', async () => {
      const { bmiCalculatorService, dependencies, inputStream } = setup();
      const writeStub = { write: stub(), end: stub(), on: stub().yields() };

      dependencies.fs.createReadStream.returns(inputStream);
      dependencies.fs.createWriteStream.returns(writeStub);

      await bmiCalculatorService.calculate();

      let writtenData = '';
      writeStub.write.args.forEach((arg) => {
        writtenData += arg[0];
      });

      return expect(() => JSON.parse(writtenData)).to.not.throw();
    });

    it('parses multiple chunks of data', async () => {
      const { bmiCalculatorService, dependencies } = setup();
      const writeStub = { write: stub(), end: stub(), on: stub().yields() };

      dependencies.fs.createReadStream.returns(Readable.from([
        JSON.stringify(inputData.slice(0, inputData.length / 2)),
        // simulate partway through JSON chunk
        JSON.stringify(inputData.slice(inputData.length / 2)).slice(0, 10),
        JSON.stringify(inputData.slice(inputData.length / 2)).slice(10),
      ]));
      dependencies.fs.createWriteStream.returns(writeStub);

      await bmiCalculatorService.calculate();

      inputData.forEach((item, i) => expect(writeStub.write.args[i + 1][0]).to
        .contain(JSON.stringify({
          ...item,
          BMI: item.WeightKg / (item.HeightCm / 100),
          BMICategory: getBMICategory(
            calculateBMIKgMetersSquared(item.WeightKg, item.HeightCm),
          ),
          HealthRisk: bmiRanges[
            getBMICategory(calculateBMIKgMetersSquared(item.WeightKg, item.HeightCm))
          ].healthRisk,
        }, null, 2)));
    });

    describe('when no output file is given', () => {
      it('defaults to the correct location', async () => {
        const { bmiCalculatorService, dependencies, inputStream } = setup();

        dependencies.fs.createReadStream.returns(inputStream);
        dependencies.fs.createWriteStream.returns(
          { write: stub(), end: stub(), on: stub().yields() },
        );

        await bmiCalculatorService.calculate();

        return expect(dependencies.fs.createWriteStream).to
          .have.been.calledWithExactly(`${__dirname}/../../data/output.json`);
      });
    });

    describe('when streaming the data throws an error', () => {
      it('rejects with an error', () => {
        const { bmiCalculatorService, dependencies } = setup();

        dependencies.fs.createReadStream.throws(new Error());

        return expect(bmiCalculatorService.calculate()).to
          .eventually.be.rejectedWith(Error, 'Unable to process BMI data');
      });
    });

    describe('when writing the data throws an error', () => {
      it('rejects with an error', () => {
        const { bmiCalculatorService, dependencies } = setup();

        dependencies.fs.createWriteStream.throws(new Error());

        return expect(bmiCalculatorService.calculate()).to
          .eventually.be.rejectedWith(Error, 'Unable to process BMI data');
      });
    });

    describe('when the data contains invalid JSON', () => {
      it('continues processing other items', async () => {
        const { bmiCalculatorService, dependencies } = setup();
        const writeStub = { write: stub(), end: stub(), on: stub().yields() };
        const invalidData = '{ invalid }';

        dependencies.fs.createReadStream.returns(
          Readable.from([
            JSON.stringify(inputData.slice(0, 1)),
            invalidData,
            JSON.stringify(inputData.slice(1)),
          ]),
        );
        dependencies.fs.createWriteStream.withArgs(`${__dirname}/../../data/output.json`).returns(writeStub);

        await bmiCalculatorService.calculate();

        expect(writeStub.write).not.to.have.been.calledWith(invalidData);
        inputData.forEach((input, i) => expect(writeStub.write.args[i + 1][0]).to
          .contain(JSON.stringify({
            ...input,
            BMI: input.WeightKg / (input.HeightCm / 100),
            BMICategory: getBMICategory(
              calculateBMIKgMetersSquared(input.WeightKg, input.HeightCm),
            ),
            HealthRisk: bmiRanges[
              getBMICategory(calculateBMIKgMetersSquared(input.WeightKg, input.HeightCm))
            ].healthRisk,
          }, null, 2)));
      });
    });
  });
});

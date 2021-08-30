/* eslint-disable no-restricted-syntax, no-continue */

const bmiRanges = {
  Underweight: { max: 18.4 },
  Normal: { min: 18.5, max: 24.9 },
  Overweight: { min: 25, max: 29.9 },
  'Moderately Obese': { min: 30, max: 34.9 },
  'Severely Obese': { min: 35, max: 39.9 },
  'Very Severely Obese': { min: 40 },
};

const calculateBMI = (m, h) => m / (h / 100);
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

module.exports = ({ fs, logger }) => ({
  calculate: async (outputFile = `${__dirname}/../../data/output.json`) => {
    try {
      const readStream = fs.createReadStream(`${__dirname}/../../data/input.json`);
      const writeStream = fs.createWriteStream(outputFile);
      let leftOvers = '';
      let count = 0;

      writeStream.write('[');

      logger.info('Reading input file...');
      for await (const chunk of readStream) {
        const data = leftOvers + Buffer.from(chunk).toString();
        let previousIndex = 0;

        logger.debug('Processing new chunk...');

        for (let currentIndex = 0; currentIndex < data.length; currentIndex += 1) {
          if (data[previousIndex] !== '{') {
            previousIndex += 1;
          }

          if (data[previousIndex] === '{' && data[currentIndex] !== '}') {
            continue;
          }

          if (data[previousIndex] === '{' && data[currentIndex] === '}') {
            try {
              const parsedPerson = JSON.parse(data.slice(previousIndex, currentIndex + 1));
              const bmi = calculateBMI(parsedPerson.WeightKg, parsedPerson.HeightCm);
              const bmiInKgMetersSquared = calculateBMIKgMetersSquared(
                parsedPerson.WeightKg, parsedPerson.HeightCm,
              );
              const updatedPerson = JSON.stringify({
                ...parsedPerson,
                BMI: bmi,
                BMICategory: getBMICategory(bmiInKgMetersSquared),
              }, null, 2);

              logger.info({ count }, 'Writing to output file...');
              writeStream.write(count === 0 ? updatedPerson : `,\n${updatedPerson}`);

              count += 1;
            } catch (err) {
              logger.warn({ err }, 'Failed to parse an item');
            }
          } else if (currentIndex === chunk.length - 1) {
            leftOvers = chunk.slice(previousIndex, currentIndex + 1);
          }

          previousIndex = currentIndex;
        }
      }

      writeStream.write(']');
      writeStream.end();

      return await new Promise((resolve) => {
        logger.info('Successfully processed input file');
        writeStream.on('finish', () => resolve());
      });
    } catch (err) {
      logger.error({ err }, 'Unable to process BMI data');
      throw new Error('Unable to process BMI data');
    }
  },
});

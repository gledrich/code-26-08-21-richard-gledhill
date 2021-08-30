module.exports = {
  ranges: {
    Underweight: { max: 18.4 },
    Normal: { min: 18.5, max: 24.9 },
    Overweight: { min: 25, max: 29.9 },
    'Moderately Obese': { min: 30, max: 34.9 },
    'Severely Obese': { min: 35, max: 39.9 },
    'Very Severely Obese': { min: 40 },
  },
  calculateBMIKgMetersSquared: (m, h) => m / ((h / 100) ** 2),
  getBMICategory: (bmiInKgMetersSquared) => {
    let category = 'Unknown';

    Object.keys(module.exports.ranges).forEach((key) => {
      const range = module.exports.ranges[key];

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
  },
};

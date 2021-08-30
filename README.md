# BMI Calculator
A program to calculate the Body Mass Index of a person(s) given their height(cm) and weight(Kg)

## Tests
Tests are run in mochajs using the chaijs asserion library
### Unit
`npm run test:unit`

**With file watching:**

`npm run test:unit:watch`

### Coverage
`npm run test:unit:coverage`

### Integation
`npm run test:integration`

### With Docker
`npm run test:docker`

## CI
Github workflows is being used for CI - see `.github/workflows`

## Running the app
`npm start`

Head to [localhost:3000](http://localhost:3000)

### Input Data
Input data is sourced from data/input.json

### Output Data
Output data is output to data/output.json
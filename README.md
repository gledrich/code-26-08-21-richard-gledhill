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
Github workflows is being used for CI - see `.github/workflows` and the [Actions](https://github.com/gledrich/code-26-08-21-richard-gledhill/actions) page.

The CI stages are:
* Unit tests (in docker)
* Integration tests (in docker)
* Build and deploy to heroku

## Development
### Running the app
`npm start`

Head to [localhost:3000](http://localhost:3000)

### Calculating BMI data
Heading to [bmi-calculator/calculate](http://localhost:3000/bmi-calculator/calculate) will trigger the BMI calculator to process `data/input.json`, write the output to `data/output.json` and return a stream of the computed data

## Production
### Heroku
The containerised docker app is deployed to heroku as the last step of the github workflow. 
Head over to [bmi-calculator-rich/readiness](http://bmi-calculator-rich.herokuapp.com/readiness) to check the app is running

### Calculating BMI data
Heading to [bmi-calculator/calculate](http://bmi-calculator-rich.herokuapp.com/bmi-calculator/calculate) will trigger the BMI calculator to process `data/input.json`, write the output to `data/output.json` and return a stream of the computed data

### Input Data
Input data is sourced from data/input.json

### Output Data
Output data is output to data/output.json
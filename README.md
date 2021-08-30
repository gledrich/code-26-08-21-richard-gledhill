# BMI Calculator
A program to calculate the Body Mass Index of a person(s) given their height(cm) and weight(Kg)

## Tests
Tests are run in mochajs using the chaijs asserion library
### Unit
Unit tests can be found in the `src/` folder under `<<MODULE>>.test.js` and run with: 

`npm run test:unit`

**With file watching:**

`npm run test:unit:watch`

### Coverage
`npm run test:unit:coverage`

### Integation
Integration tests can be found in the `test/integration/` folder under `<<MODULE>>.test.js` and run with: 

`npm run test:integration`

### With Docker
`npm run test:docker`

## CI
Github workflows is being used for CI - see `.github/workflows` and the [Actions](https://github.com/gledrich/code-26-08-21-richard-gledhill/actions) page.

The CI stages are:
* Unit tests (in docker)
* Integration tests (in docker)
* Build in docker and deploy to heroku

![Actions](/readme/actions.png)

## Development
### Hooks
Husky is being used for git hooks
#### Pre-Push
Before pushing, husky will run `npm run test:unit:coverage && npm run test:docker`

### Running the app
`npm start`

Head to [localhost:3000](http://localhost:3000)

### Calculating BMI data
Heading to [bmi-calculator/calculate](http://localhost:3000/bmi-calculator/calculate) will trigger the BMI calculator to process `data/input.json`, write the output to `data/output.json` and return a stream of the computed data.

## Production
### Heroku
The containerised docker app is deployed to heroku as the last step of the github workflow. 
Head over to [bmi-calculator-rich/readiness](http://bmi-calculator-rich.herokuapp.com/readiness) to check the app is running.

### Calculating BMI data
Heading to [bmi-calculator/calculate](http://bmi-calculator-rich.herokuapp.com/bmi-calculator/calculate) will trigger the BMI calculator to process `data/input.json`, write the output to `data/output.json` and return a stream of the computed data.

### Input Data
Input data is sourced from data/input.json

### Output Data
Output data is output to data/output.json

### Observations
#### **BMI in Kg/m**
BMI of person 1 = 96 / (171 / 100) = 56.1403508772 Kg/m

BMI of person 2 = 85 / (161 / 100) = 52.7950310559 Kg/m

BMI of person 3 = 77 / (180 / 100) = 42.7777777778 Kg/m

BMI of person 4 = 62 / (166 / 100) = 37.3493975904 Kg/m

BMI of person 5 = 70 / (150 / 100) = 46.6666666667 Kg/m

BMI of person 6 = 82 / (167 / 100) = 49.1017964072 Kg/m

#### **BMI in Kg/m<sup>2</sup>**
BMI of person 1 = 96 / (171 / 100)<sup>2</sup> = 32.8306145481 Kg/m<sup>2</sup>

BMI of person 2 = 85 / (161 / 100)<sup>2</sup> = 32.7919447552 Kg/m<sup>2</sup>

BMI of person 3 = 77 / (180 / 100)<sup>2</sup> = 23.7654320988 Kg/m<sup>2</sup>

BMI of person 4 = 62 / (166 / 100)<sup>2</sup> = 22.4996371026 Kg/m<sup>2</sup>

BMI of person 5 = 70 / (150 / 100)<sup>2</sup> = 31.1111111111 Kg/m<sup>2</sup>

BMI of person 6 = 82 / (167 / 100)<sup>2</sup> = 29.4022732977 Kg/m<sup>2</sup>

#### **BMI Category**
Summary
* 2 Normal
* 1 Overweight
* 3 Moderately Obese


BMI Category of person 1 = Moderately Obese (Medium Risk)

BMI Category of person 2 = Moderately Obese (Medium Risk)

BMI Category of person 3 = Normal (Low Risk)

BMI Category of person 4 = Normal (Low Risk)

BMI Category of person 5 = Moderately Obese (Medium Risk)

BMI Category of person 6 = Overweight (Enhanced Risk)
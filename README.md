# uddf2js

Parse UDDF XML dive logs to JavaScript objects with unit conversion.

## Features

- Parses UDDF (Universal Dive Data Format) XML files
- Converts units to SI, metric, or imperial
- Always returns arrays for dives and waypoints
- Robust against missing sections

## Installation

```sh
npm install uddf2js
```

## Usage

```node
const { parseUDDF } = require('uddf2js');
const fs = require('fs');

const xmlData = fs.readFileSync('mydive.uddf', 'utf8');
parseUDDF(xmlData, 'metric').then(result => {
  console.log(result.unit); // 'metric'
  const waypoints = result.data.uddf.profiledata.repetitiongroup[0].dive[0].samples.waypoint;
  console.log(waypoints);
});
```

## Unit Options

- `'si'` (default): SI units (Kelvin, m^3, meters, bar)
- `'metric'`: Celsius, liters, meters, bar
  - seconds are not converted to minutes
- `'imperial'`: Fahrenheit, cubic feet, feet, PSI
  - seconds are converted to minutes, but if it's between 1 and 59 seconds, it will be a string like `'0:ss'`

## API

`parseUDDF(xmlData, unit)`

- `xmlData`: String containing UDDF XML
- `unit`: 'si', 'metric', or 'imperial' (optional)
- Returns: Promise resolving to `{ unit, data }`

## License

MIT

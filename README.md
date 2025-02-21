# da-log

Just a simple javascript logger.

## Installation

```bash
npm install @merofuruya/da-log
```

## Usage

```javascript
import {
  addOutput,
  Formatters,
  Outputs,
  createLogger,
} from '@merofuruya/da-log';

addOutput(Formatters.pretty(), Outputs.console());

const logger = createLogger('myapp');
logger.prefix('module1').param('weather', {celsius: 23}).info('Hello, world!');
```


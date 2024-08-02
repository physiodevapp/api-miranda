import { config as dotenvConfig } from 'dotenv';

const loadEnvConfig = () => {
  if (process.env.NODE_ENV === 'test') {
    dotenvConfig({ path: '.env.test' });
  } else {
    dotenvConfig({ path: '.env' });
  }
};

module.exports = loadEnvConfig;

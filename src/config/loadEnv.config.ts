import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const loadEnvConfig = () => {
  let env;

  if (process.env.NODE_ENV === 'test')
    env = '../../.env.test.json'
  else if (process.env.NODE_ENV === 'dev')
    env = '../../.env.dev.json'
  else
    env = '../../.env.json'

  try {
    const envPath = path.resolve(__dirname, env);
    const envConfig = JSON.parse(fs.readFileSync(envPath, 'utf-8'));

    Object.keys(envConfig).forEach(key => {
      process.env[key] = envConfig[key];
    });

    dotenv.config();

  } catch (error) {
    console.error(`Failed to load environment variables from ${env}:`, error);
  }
};

module.exports = loadEnvConfig;

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
};

export const env = {
  BASE_URL: required('BASE_URL'),
  STANDARD_USER: required('STANDARD_USER'),
  LOCKED_OUT_USER: required('LOCKED_OUT_USER'),
  PROBLEM_USER: required('PROBLEM_USER'),
  PERFORMANCE_GLITCH_USER: required('PERFORMANCE_GLITCH_USER'),
  ERROR_USER: required('ERROR_USER'),
  VISUAL_USER: required('VISUAL_USER'),
  PASSWORD: required('PASSWORD'),
};

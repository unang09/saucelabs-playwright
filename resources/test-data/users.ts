import { env } from '../../resources/config/env.config';

export const users = {
  standard: env.STANDARD_USER,
  lockedOut: env.LOCKED_OUT_USER,
  problem: env.PROBLEM_USER,
  performanceGlitch: env.PERFORMANCE_GLITCH_USER,
  error: env.ERROR_USER,
  visual: env.VISUAL_USER,
  password: env.PASSWORD,
};
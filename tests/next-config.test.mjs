import { expect, it } from 'vitest';
import config from '../next.config.mjs';

it('opts out of Next.js automatic agent instruction generation', () => {
  expect(config.agentRules).toBe(false);
});

import type { Scenario } from '../../core/types.js';
import healthCheck from './01-health-check.js';
import authFlow from './02-auth-flow.js';
import navigation from './03-navigation.js';

export const genericScenarios: Scenario[] = [
  healthCheck,
  authFlow,
  navigation,
];

export default genericScenarios;

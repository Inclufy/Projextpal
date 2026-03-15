import type { Scenario } from '../../core/types.js';
import login from './01-login.js';
import dashboard from './02-dashboard.js';
import campaigns from './03-campaigns.js';
import contacts from './04-contacts.js';
import apiHealth from './05-api-health.js';

export const marketingScenarios: Scenario[] = [
  login,
  dashboard,
  campaigns,
  contacts,
  apiHealth,
];

export default marketingScenarios;

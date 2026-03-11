import type { Scenario } from '../../core/types.js';
import login from './01-login.js';
import projectCrud from './02-project-crud.js';
import taskManagement from './03-task-management.js';
import aiChat from './04-ai-chat.js';
import kanbanBoard from './05-kanban-board.js';
import scrumSprint from './06-scrum-sprint.js';
import dashboard from './07-dashboard.js';
import academy from './08-academy.js';
import programs from './09-programs.js';
import apiHealth from './10-api-health.js';

export const projectpalScenarios: Scenario[] = [
  login,
  projectCrud,
  taskManagement,
  aiChat,
  kanbanBoard,
  scrumSprint,
  dashboard,
  academy,
  programs,
  apiHealth,
];

export default projectpalScenarios;

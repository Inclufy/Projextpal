-- =====================================================================
-- ProjeXtPal demo-veilige schema-drift patch
-- =====================================================================
-- Conservative defaults for the tables actively used in the demo flow:
--   login → create project → milestones → tasks → assign → comments
--
-- SCOPE: projects_*, agile_*, kanban_*, scrum_*, programs_*, charater_*,
--        prince2_*, waterfall_*, sixsigma_*, accounts_*
-- EXCLUDED:
--   - UUID columns (''  is invalid syntax for uuid type)
--   - *_id FK columns (Django always sets these explicitly via FK fields;
--     setting DEFAULT 0 could create orphan references)
--   - is_active booleans (semantic risk: "active by default" is the norm)
--   - Tokens / API keys (security-sensitive; require explicit values)
--
-- Apply with:
--   docker exec -i projextpal-postgres-prod psql -U projextpal -d projextpal \
--       < scripts/demo_safe_drift_patch.sql
--
-- Pre-existing rows are NOT modified. Only future INSERTs see defaults.
-- =====================================================================

BEGIN;

-- ===== accounts =====
ALTER TABLE accounts_company ALTER COLUMN is_subscribed SET DEFAULT false;
ALTER TABLE accounts_customuser ALTER COLUMN is_superuser SET DEFAULT false;
ALTER TABLE accounts_customuser ALTER COLUMN first_name SET DEFAULT '';
ALTER TABLE accounts_customuser ALTER COLUMN last_name SET DEFAULT '';
ALTER TABLE accounts_customuser ALTER COLUMN is_staff SET DEFAULT false;
ALTER TABLE accounts_customuser ALTER COLUMN role SET DEFAULT 'pm';
ALTER TABLE accounts_customuser ALTER COLUMN theme SET DEFAULT 'light';

-- ===== projects (core demo flow) =====
ALTER TABLE projects_milestone ALTER COLUMN description SET DEFAULT '';
ALTER TABLE projects_milestone ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE projects_milestone ALTER COLUMN order_index SET DEFAULT 0;

ALTER TABLE projects_task ALTER COLUMN description SET DEFAULT '';
ALTER TABLE projects_task ALTER COLUMN status SET DEFAULT 'todo';
ALTER TABLE projects_task ALTER COLUMN priority SET DEFAULT 'medium';
ALTER TABLE projects_task ALTER COLUMN progress SET DEFAULT 0;
ALTER TABLE projects_task ALTER COLUMN order_index SET DEFAULT 0;

ALTER TABLE projects_subtask ALTER COLUMN completed SET DEFAULT false;

ALTER TABLE projects_risk ALTER COLUMN description SET DEFAULT '';
ALTER TABLE projects_risk ALTER COLUMN category SET DEFAULT 'general';
ALTER TABLE projects_risk ALTER COLUMN impact SET DEFAULT 'medium';
ALTER TABLE projects_risk ALTER COLUMN probability SET DEFAULT 0;
ALTER TABLE projects_risk ALTER COLUMN level SET DEFAULT 'medium';
ALTER TABLE projects_risk ALTER COLUMN status SET DEFAULT 'open';

ALTER TABLE projects_aimitigation ALTER COLUMN strategy SET DEFAULT '';
ALTER TABLE projects_aimitigation ALTER COLUMN actions SET DEFAULT '[]'::jsonb;
ALTER TABLE projects_aimitigation ALTER COLUMN timeline SET DEFAULT '';
ALTER TABLE projects_aimitigation ALTER COLUMN cost SET DEFAULT '';
ALTER TABLE projects_aimitigation ALTER COLUMN effectiveness SET DEFAULT '';

ALTER TABLE projects_manualmitigation ALTER COLUMN strategy SET DEFAULT '';
ALTER TABLE projects_manualmitigation ALTER COLUMN actions SET DEFAULT '[]'::jsonb;
ALTER TABLE projects_manualmitigation ALTER COLUMN timeline SET DEFAULT '';
ALTER TABLE projects_manualmitigation ALTER COLUMN cost SET DEFAULT '';
ALTER TABLE projects_manualmitigation ALTER COLUMN effectiveness SET DEFAULT 0;
ALTER TABLE projects_manualmitigation ALTER COLUMN notes SET DEFAULT '';

ALTER TABLE projects_approvalstage ALTER COLUMN value SET DEFAULT '';
ALTER TABLE projects_approvalstage ALTER COLUMN description SET DEFAULT '';
ALTER TABLE projects_approvalstage ALTER COLUMN order_index SET DEFAULT 0;
ALTER TABLE projects_approvalstage ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE projects_approvalstage ALTER COLUMN approver_name SET DEFAULT '';
ALTER TABLE projects_approvalstage ALTER COLUMN approver_role SET DEFAULT '';
ALTER TABLE projects_approvalstage ALTER COLUMN approver_comments SET DEFAULT '';

ALTER TABLE projects_budgetcategory ALTER COLUMN allocated SET DEFAULT 0;

ALTER TABLE projects_budgetitem ALTER COLUMN description SET DEFAULT '';
ALTER TABLE projects_budgetitem ALTER COLUMN amount SET DEFAULT 0;
ALTER TABLE projects_budgetitem ALTER COLUMN date SET DEFAULT CURRENT_DATE;
ALTER TABLE projects_budgetitem ALTER COLUMN type SET DEFAULT 'expense';
ALTER TABLE projects_budgetitem ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE projects_projectbudget ALTER COLUMN total_budget SET DEFAULT 0;
ALTER TABLE projects_projectbudget ALTER COLUMN currency SET DEFAULT 'EUR';

ALTER TABLE projects_expense ALTER COLUMN description SET DEFAULT '';
ALTER TABLE projects_expense ALTER COLUMN category SET DEFAULT 'general';
ALTER TABLE projects_expense ALTER COLUMN date SET DEFAULT CURRENT_DATE;
ALTER TABLE projects_expense ALTER COLUMN amount SET DEFAULT 0;
ALTER TABLE projects_expense ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE projects_document ALTER COLUMN description SET DEFAULT '';
ALTER TABLE projects_document ALTER COLUMN category SET DEFAULT 'general';
ALTER TABLE projects_document ALTER COLUMN status SET DEFAULT 'draft';
ALTER TABLE projects_document ALTER COLUMN linked_stages SET DEFAULT '[]'::jsonb;

ALTER TABLE projects_projectactivity ALTER COLUMN action SET DEFAULT '';
ALTER TABLE projects_projectactivity ALTER COLUMN message SET DEFAULT '';

ALTER TABLE projects_projectevent ALTER COLUMN description SET DEFAULT '';
ALTER TABLE projects_projectevent ALTER COLUMN start_date SET DEFAULT CURRENT_DATE;
ALTER TABLE projects_projectevent ALTER COLUMN end_date SET DEFAULT CURRENT_DATE;

ALTER TABLE projects_projectteam ALTER COLUMN added_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE projects_projectteam ALTER COLUMN hourly_rate SET DEFAULT 0;

ALTER TABLE projects_timeentry ALTER COLUMN date SET DEFAULT CURRENT_DATE;
ALTER TABLE projects_timeentry ALTER COLUMN hours SET DEFAULT 0;
ALTER TABLE projects_timeentry ALTER COLUMN description SET DEFAULT '';
ALTER TABLE projects_timeentry ALTER COLUMN status SET DEFAULT 'draft';
ALTER TABLE projects_timeentry ALTER COLUMN hourly_rate_snapshot SET DEFAULT 0;
ALTER TABLE projects_timeentry ALTER COLUMN billable SET DEFAULT true;

ALTER TABLE projects_trainingmaterial ALTER COLUMN description SET DEFAULT '';
ALTER TABLE projects_trainingmaterial ALTER COLUMN audience SET DEFAULT '';
ALTER TABLE projects_trainingmaterial ALTER COLUMN format_type SET DEFAULT '';
ALTER TABLE projects_trainingmaterial ALTER COLUMN status SET DEFAULT 'draft';

ALTER TABLE projects_upload ALTER COLUMN file SET DEFAULT '';

-- ===== agile (geselecteerde methodologie) =====
ALTER TABLE agile_agilebacklogitem ALTER COLUMN description SET DEFAULT '';
ALTER TABLE agile_agilebacklogitem ALTER COLUMN acceptance_criteria SET DEFAULT '';
ALTER TABLE agile_agilebacklogitem ALTER COLUMN item_type SET DEFAULT 'story';
ALTER TABLE agile_agilebacklogitem ALTER COLUMN priority SET DEFAULT 'medium';
ALTER TABLE agile_agilebacklogitem ALTER COLUMN status SET DEFAULT 'todo';
ALTER TABLE agile_agilebacklogitem ALTER COLUMN "order" SET DEFAULT 0;

ALTER TABLE agile_agilebudget ALTER COLUMN total_budget SET DEFAULT 0;
ALTER TABLE agile_agilebudget ALTER COLUMN currency SET DEFAULT 'EUR';

ALTER TABLE agile_agilebudgetitem ALTER COLUMN category SET DEFAULT 'general';
ALTER TABLE agile_agilebudgetitem ALTER COLUMN description SET DEFAULT '';
ALTER TABLE agile_agilebudgetitem ALTER COLUMN planned_amount SET DEFAULT 0;
ALTER TABLE agile_agilebudgetitem ALTER COLUMN actual_amount SET DEFAULT 0;

ALTER TABLE agile_agiledailyupdate ALTER COLUMN date SET DEFAULT CURRENT_DATE;
ALTER TABLE agile_agiledailyupdate ALTER COLUMN yesterday SET DEFAULT '';
ALTER TABLE agile_agiledailyupdate ALTER COLUMN today SET DEFAULT '';
ALTER TABLE agile_agiledailyupdate ALTER COLUMN blockers SET DEFAULT '';

ALTER TABLE agile_agileepic ALTER COLUMN description SET DEFAULT '';
ALTER TABLE agile_agileepic ALTER COLUMN priority SET DEFAULT 'medium';
ALTER TABLE agile_agileepic ALTER COLUMN color SET DEFAULT '#7c3aed';
ALTER TABLE agile_agileepic ALTER COLUMN "order" SET DEFAULT 0;

ALTER TABLE agile_agileiteration ALTER COLUMN goal SET DEFAULT '';
ALTER TABLE agile_agileiteration ALTER COLUMN start_date SET DEFAULT CURRENT_DATE;
ALTER TABLE agile_agileiteration ALTER COLUMN end_date SET DEFAULT CURRENT_DATE;
ALTER TABLE agile_agileiteration ALTER COLUMN status SET DEFAULT 'planning';
ALTER TABLE agile_agileiteration ALTER COLUMN velocity_committed SET DEFAULT 0;
ALTER TABLE agile_agileiteration ALTER COLUMN velocity_completed SET DEFAULT 0;

ALTER TABLE agile_agileproductgoal ALTER COLUMN description SET DEFAULT '';
ALTER TABLE agile_agileproductgoal ALTER COLUMN priority SET DEFAULT 'medium';
ALTER TABLE agile_agileproductgoal ALTER COLUMN status SET DEFAULT 'open';
ALTER TABLE agile_agileproductgoal ALTER COLUMN "order" SET DEFAULT 0;

ALTER TABLE agile_agileproductvision ALTER COLUMN vision_statement SET DEFAULT '';
ALTER TABLE agile_agileproductvision ALTER COLUMN target_audience SET DEFAULT '';
ALTER TABLE agile_agileproductvision ALTER COLUMN problem_statement SET DEFAULT '';
ALTER TABLE agile_agileproductvision ALTER COLUMN unique_value_proposition SET DEFAULT '';
ALTER TABLE agile_agileproductvision ALTER COLUMN success_criteria SET DEFAULT '[]'::jsonb;

ALTER TABLE agile_agilerelease ALTER COLUMN version SET DEFAULT '';
ALTER TABLE agile_agilerelease ALTER COLUMN description SET DEFAULT '';
ALTER TABLE agile_agilerelease ALTER COLUMN target_date SET DEFAULT CURRENT_DATE;
ALTER TABLE agile_agilerelease ALTER COLUMN status SET DEFAULT 'planned';
ALTER TABLE agile_agilerelease ALTER COLUMN features SET DEFAULT '[]'::jsonb;

ALTER TABLE agile_agileretroitem ALTER COLUMN category SET DEFAULT 'general';
ALTER TABLE agile_agileretroitem ALTER COLUMN content SET DEFAULT '';
ALTER TABLE agile_agileretroitem ALTER COLUMN votes SET DEFAULT 0;
ALTER TABLE agile_agileretroitem ALTER COLUMN status SET DEFAULT 'open';

ALTER TABLE agile_agileretrospective ALTER COLUMN date SET DEFAULT CURRENT_DATE;
ALTER TABLE agile_agileretrospective ALTER COLUMN notes SET DEFAULT '';

ALTER TABLE agile_agileteammember ALTER COLUMN role SET DEFAULT 'developer';
ALTER TABLE agile_agileteammember ALTER COLUMN capacity_hours SET DEFAULT 40;
ALTER TABLE agile_agileteammember ALTER COLUMN skills SET DEFAULT '[]'::jsonb;
ALTER TABLE agile_agileteammember ALTER COLUMN joined_at SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE agile_agileuserpersona ALTER COLUMN role SET DEFAULT '';
ALTER TABLE agile_agileuserpersona ALTER COLUMN age_range SET DEFAULT '';
ALTER TABLE agile_agileuserpersona ALTER COLUMN background SET DEFAULT '';
ALTER TABLE agile_agileuserpersona ALTER COLUMN goals SET DEFAULT '[]'::jsonb;
ALTER TABLE agile_agileuserpersona ALTER COLUMN pain_points SET DEFAULT '[]'::jsonb;
ALTER TABLE agile_agileuserpersona ALTER COLUMN quote SET DEFAULT '';
ALTER TABLE agile_agileuserpersona ALTER COLUMN avatar_color SET DEFAULT '#7c3aed';

ALTER TABLE agile_definitionofdone ALTER COLUMN scope SET DEFAULT 'project';
ALTER TABLE agile_definitionofdone ALTER COLUMN description SET DEFAULT '';
ALTER TABLE agile_definitionofdone ALTER COLUMN checklist SET DEFAULT '[]'::jsonb;

ALTER TABLE agile_dodchecklistcompletion ALTER COLUMN checklist_item SET DEFAULT '';
ALTER TABLE agile_dodchecklistcompletion ALTER COLUMN is_completed SET DEFAULT false;
ALTER TABLE agile_dodchecklistcompletion ALTER COLUMN notes SET DEFAULT '';

ALTER TABLE agile_iterationreview ALTER COLUMN scheduled_date SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE agile_iterationreview ALTER COLUMN duration_minutes SET DEFAULT 60;
ALTER TABLE agile_iterationreview ALTER COLUMN status SET DEFAULT 'scheduled';
ALTER TABLE agile_iterationreview ALTER COLUMN stakeholders SET DEFAULT '';
ALTER TABLE agile_iterationreview ALTER COLUMN demo_items SET DEFAULT '[]'::jsonb;
ALTER TABLE agile_iterationreview ALTER COLUMN feedback SET DEFAULT '';
ALTER TABLE agile_iterationreview ALTER COLUMN action_items SET DEFAULT '[]'::jsonb;
ALTER TABLE agile_iterationreview ALTER COLUMN iteration_goal_achieved SET DEFAULT false;
ALTER TABLE agile_iterationreview ALTER COLUMN completed_story_points SET DEFAULT 0;

ALTER TABLE agile_reviewfeedback ALTER COLUMN feedback_type SET DEFAULT 'general';
ALTER TABLE agile_reviewfeedback ALTER COLUMN content SET DEFAULT '';
ALTER TABLE agile_reviewfeedback ALTER COLUMN priority SET DEFAULT 'medium';

-- ===== programs =====
ALTER TABLE programs_program ALTER COLUMN description SET DEFAULT '';
ALTER TABLE programs_program ALTER COLUMN strategic_objective SET DEFAULT '';
ALTER TABLE programs_program ALTER COLUMN methodology SET DEFAULT 'agile';
ALTER TABLE programs_program ALTER COLUMN status SET DEFAULT 'planning';
ALTER TABLE programs_program ALTER COLUMN health_status SET DEFAULT 'green';
ALTER TABLE programs_program ALTER COLUMN total_budget SET DEFAULT 0;
ALTER TABLE programs_program ALTER COLUMN spent_budget SET DEFAULT 0;
ALTER TABLE programs_program ALTER COLUMN currency SET DEFAULT 'EUR';
ALTER TABLE programs_program ALTER COLUMN program_code SET DEFAULT '';

ALTER TABLE programs_programbudget ALTER COLUMN total_budget SET DEFAULT 0;
ALTER TABLE programs_programbudget ALTER COLUMN currency SET DEFAULT 'EUR';

ALTER TABLE programs_programbudgetcategory ALTER COLUMN allocated SET DEFAULT 0;

ALTER TABLE programs_programbudgetitem ALTER COLUMN description SET DEFAULT '';
ALTER TABLE programs_programbudgetitem ALTER COLUMN amount SET DEFAULT 0;
ALTER TABLE programs_programbudgetitem ALTER COLUMN date SET DEFAULT CURRENT_DATE;
ALTER TABLE programs_programbudgetitem ALTER COLUMN type SET DEFAULT 'expense';
ALTER TABLE programs_programbudgetitem ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE programs_programmilestone ALTER COLUMN description SET DEFAULT '';
ALTER TABLE programs_programmilestone ALTER COLUMN target_date SET DEFAULT CURRENT_DATE;
ALTER TABLE programs_programmilestone ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE programs_programrisk ALTER COLUMN description SET DEFAULT '';
ALTER TABLE programs_programrisk ALTER COLUMN impact SET DEFAULT 'medium';
ALTER TABLE programs_programrisk ALTER COLUMN probability SET DEFAULT 'medium';
ALTER TABLE programs_programrisk ALTER COLUMN status SET DEFAULT 'open';
ALTER TABLE programs_programrisk ALTER COLUMN mitigation_plan SET DEFAULT '';

ALTER TABLE programs_programbenefit ALTER COLUMN description SET DEFAULT '';
ALTER TABLE programs_programbenefit ALTER COLUMN category SET DEFAULT 'general';
ALTER TABLE programs_programbenefit ALTER COLUMN status SET DEFAULT 'planned';
ALTER TABLE programs_programbenefit ALTER COLUMN measurement_unit SET DEFAULT '';

-- ===== charter (project charters used in demo) =====
ALTER TABLE charater_programcharter ALTER COLUMN description SET DEFAULT '';
ALTER TABLE charater_programcharter ALTER COLUMN version SET DEFAULT 1;
ALTER TABLE charater_programcharter ALTER COLUMN project_orchestrator SET DEFAULT '';
ALTER TABLE charater_programcharter ALTER COLUMN project_manager SET DEFAULT '';
ALTER TABLE charater_programcharter ALTER COLUMN goal_objective SET DEFAULT '';
ALTER TABLE charater_programcharter ALTER COLUMN locked SET DEFAULT false;

ALTER TABLE charater_keydeliverable ALTER COLUMN description SET DEFAULT '';
ALTER TABLE charater_keyrisk ALTER COLUMN description SET DEFAULT '';
ALTER TABLE charater_scopecapability ALTER COLUMN description SET DEFAULT '';
ALTER TABLE charater_criticalinterdependency ALTER COLUMN description SET DEFAULT '';
ALTER TABLE charater_resource ALTER COLUMN role SET DEFAULT '';
ALTER TABLE charater_resource ALTER COLUMN required SET DEFAULT '';
ALTER TABLE charater_dependency ALTER COLUMN type SET DEFAULT '';
ALTER TABLE charater_dependency ALTER COLUMN status SET DEFAULT 'open';

-- ===== execution =====
ALTER TABLE execution_changerequest ALTER COLUMN description SET DEFAULT '';
ALTER TABLE execution_changerequest ALTER COLUMN change_type SET DEFAULT 'scope';
ALTER TABLE execution_changerequest ALTER COLUMN priority SET DEFAULT 'medium';
ALTER TABLE execution_changerequest ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE execution_changerequest ALTER COLUMN impact_description SET DEFAULT '';
ALTER TABLE execution_changerequest ALTER COLUMN requested_date SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE execution_changerequest ALTER COLUMN review_comments SET DEFAULT '';

ALTER TABLE execution_governance ALTER COLUMN structure_data SET DEFAULT '{}'::jsonb;
ALTER TABLE execution_governance ALTER COLUMN impact_data SET DEFAULT '{}'::jsonb;
ALTER TABLE execution_governance ALTER COLUMN risks_data SET DEFAULT '{}'::jsonb;
ALTER TABLE execution_governance ALTER COLUMN meeting_cadence SET DEFAULT 'weekly';
ALTER TABLE execution_governance ALTER COLUMN change_control_process SET DEFAULT '';
ALTER TABLE execution_governance ALTER COLUMN decision_rights SET DEFAULT '{}'::jsonb;

ALTER TABLE execution_stakeholder ALTER COLUMN role SET DEFAULT '';
ALTER TABLE execution_stakeholder ALTER COLUMN contact SET DEFAULT '';
ALTER TABLE execution_stakeholder ALTER COLUMN influence SET DEFAULT 'medium';
ALTER TABLE execution_stakeholder ALTER COLUMN governance_type SET DEFAULT 'stakeholder';

-- ===== kanban (vaak gebruikt voor visualisatie) =====
ALTER TABLE kanban_kanbancard ALTER COLUMN card_type SET DEFAULT 'story';
ALTER TABLE kanban_kanbancard ALTER COLUMN priority SET DEFAULT 'medium';
ALTER TABLE kanban_kanbancard ALTER COLUMN "order" SET DEFAULT 0;
ALTER TABLE kanban_kanbancard ALTER COLUMN entered_column_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE kanban_kanbancard ALTER COLUMN is_blocked SET DEFAULT false;

ALTER TABLE kanban_kanbancolumn ALTER COLUMN column_type SET DEFAULT 'general';
ALTER TABLE kanban_kanbancolumn ALTER COLUMN "order" SET DEFAULT 0;
ALTER TABLE kanban_kanbancolumn ALTER COLUMN color SET DEFAULT '#7c3aed';
ALTER TABLE kanban_kanbancolumn ALTER COLUMN is_done_column SET DEFAULT false;

ALTER TABLE kanban_kanbanswimlane ALTER COLUMN "order" SET DEFAULT 0;
ALTER TABLE kanban_kanbanswimlane ALTER COLUMN color SET DEFAULT '#7c3aed';
ALTER TABLE kanban_kanbanswimlane ALTER COLUMN is_default SET DEFAULT false;

ALTER TABLE kanban_cardchecklist ALTER COLUMN "order" SET DEFAULT 0;

ALTER TABLE kanban_cardcomment ALTER COLUMN content SET DEFAULT '';

ALTER TABLE kanban_cardhistory ALTER COLUMN moved_at SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE kanban_checklistitem ALTER COLUMN text SET DEFAULT '';
ALTER TABLE kanban_checklistitem ALTER COLUMN is_completed SET DEFAULT false;
ALTER TABLE kanban_checklistitem ALTER COLUMN "order" SET DEFAULT 0;

-- ===== scrum (mogelijk voor demo, voor zekerheid) =====
ALTER TABLE scrum_backlogitem ALTER COLUMN item_type SET DEFAULT 'story';
ALTER TABLE scrum_backlogitem ALTER COLUMN priority SET DEFAULT 'medium';
ALTER TABLE scrum_backlogitem ALTER COLUMN status SET DEFAULT 'todo';
ALTER TABLE scrum_backlogitem ALTER COLUMN "order" SET DEFAULT 0;

ALTER TABLE scrum_dailystandup ALTER COLUMN date SET DEFAULT CURRENT_DATE;

ALTER TABLE scrum_definitionofdone ALTER COLUMN item SET DEFAULT '';
ALTER TABLE scrum_definitionofdone ALTER COLUMN "order" SET DEFAULT 0;
ALTER TABLE scrum_definitionofdone ALTER COLUMN checklist SET DEFAULT '[]'::jsonb;

ALTER TABLE scrum_scrumteam ALTER COLUMN role SET DEFAULT 'developer';

ALTER TABLE scrum_sprint ALTER COLUMN number SET DEFAULT 1;
ALTER TABLE scrum_sprint ALTER COLUMN status SET DEFAULT 'planning';

ALTER TABLE scrum_sprintburndown ALTER COLUMN date SET DEFAULT CURRENT_DATE;
ALTER TABLE scrum_sprintburndown ALTER COLUMN remaining_points SET DEFAULT 0;
ALTER TABLE scrum_sprintburndown ALTER COLUMN completed_points SET DEFAULT 0;

ALTER TABLE scrum_sprintreview ALTER COLUMN action_items SET DEFAULT '[]'::jsonb;
ALTER TABLE scrum_sprintreview ALTER COLUMN completed_story_points SET DEFAULT 0;
ALTER TABLE scrum_sprintreview ALTER COLUMN sprint_goal_achieved SET DEFAULT false;

ALTER TABLE scrum_velocity ALTER COLUMN committed_points SET DEFAULT 0;
ALTER TABLE scrum_velocity ALTER COLUMN completed_points SET DEFAULT 0;

-- ===== notifications (vandaag gedeployd, voor zekerheid) =====
ALTER TABLE notifications_notification ALTER COLUMN kind SET DEFAULT '';
ALTER TABLE notifications_notification ALTER COLUMN body SET DEFAULT '';
ALTER TABLE notifications_notification ALTER COLUMN target_url SET DEFAULT '';
ALTER TABLE notifications_notification ALTER COLUMN payload SET DEFAULT '{}'::jsonb;
ALTER TABLE notifications_notification ALTER COLUMN is_read SET DEFAULT false;
ALTER TABLE notifications_notification ALTER COLUMN email_sent SET DEFAULT false;

ALTER TABLE notifications_notificationpreference ALTER COLUMN email_task_assigned SET DEFAULT true;
ALTER TABLE notifications_notificationpreference ALTER COLUMN email_comment_mention SET DEFAULT true;
ALTER TABLE notifications_notificationpreference ALTER COLUMN email_project_member_added SET DEFAULT true;
ALTER TABLE notifications_notificationpreference ALTER COLUMN email_deadline_approaching SET DEFAULT true;
ALTER TABLE notifications_notificationpreference ALTER COLUMN in_app_enabled SET DEFAULT true;
ALTER TABLE notifications_notificationpreference ALTER COLUMN email_enabled SET DEFAULT true;

COMMIT;

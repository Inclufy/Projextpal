// Form logic for the "Log Time Entry" dialog and timer on the Time Tracking page.
// Task is optional on a time entry (backend: TimeEntry.task is null=True/blank=True).

/** Sentinel value for the explicit "No task" option in the task Select. */
export const NO_TASK = "none";

export interface TimeEntryFormValues {
  projectId: string;
  hours: string;
  minutes: string;
}

export interface TimeEntryFormErrors {
  project?: string;
  duration?: string;
}

export function getTotalMinutes(hours: string, minutes: string): number {
  return (parseInt(hours, 10) || 0) * 60 + (parseInt(minutes, 10) || 0);
}

/** Task is intentionally NOT validated — it is optional. */
export function validateTimeEntryForm(values: TimeEntryFormValues): TimeEntryFormErrors {
  const errors: TimeEntryFormErrors = {};
  if (!values.projectId) {
    errors.project = "Please select a project";
  }
  if (getTotalMinutes(values.hours, values.minutes) <= 0) {
    errors.duration = "Please enter a duration";
  }
  return errors;
}

export interface TimeEntryPayload {
  project: number;
  task: number | null;
  date: string;
  hours: number;
  description: string;
}

export function buildTimeEntryPayload(input: {
  projectId: string;
  taskId?: string | null;
  date: string;
  durationMinutes: number;
  description?: string;
}): TimeEntryPayload {
  const taskId =
    input.taskId && input.taskId !== NO_TASK ? parseInt(input.taskId, 10) : NaN;
  return {
    project: parseInt(input.projectId, 10),
    task: Number.isNaN(taskId) ? null : taskId,
    date: input.date,
    hours: input.durationMinutes / 60,
    description: input.description || "",
  };
}

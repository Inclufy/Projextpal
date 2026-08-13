import { describe, expect, it } from "vitest";
import {
  NO_TASK,
  buildTimeEntryPayload,
  getTotalMinutes,
  validateTimeEntryForm,
} from "@/lib/timeEntryForm";

describe("validateTimeEntryForm", () => {
  it("passes with project and duration but no task (task is optional)", () => {
    const errors = validateTimeEntryForm({ projectId: "7", hours: "2", minutes: "30" });
    expect(errors).toEqual({});
  });

  it("requires a project", () => {
    const errors = validateTimeEntryForm({ projectId: "", hours: "2", minutes: "30" });
    expect(errors.project).toBeTruthy();
  });

  it("requires a non-zero duration", () => {
    expect(validateTimeEntryForm({ projectId: "7", hours: "", minutes: "" }).duration).toBeTruthy();
    expect(validateTimeEntryForm({ projectId: "7", hours: "0", minutes: "0" }).duration).toBeTruthy();
  });
});

describe("getTotalMinutes", () => {
  it("combines hours and minutes", () => {
    expect(getTotalMinutes("2", "30")).toBe(150);
  });

  it("treats empty strings as zero", () => {
    expect(getTotalMinutes("", "")).toBe(0);
    expect(getTotalMinutes("1", "")).toBe(60);
  });
});

describe("buildTimeEntryPayload", () => {
  const base = { projectId: "7", date: "2026-08-13", durationMinutes: 150 };

  it("sends task: null when no task is selected", () => {
    expect(buildTimeEntryPayload({ ...base, taskId: "" })).toEqual({
      project: 7,
      task: null,
      date: "2026-08-13",
      hours: 2.5,
      description: "",
    });
    expect(buildTimeEntryPayload({ ...base, taskId: null }).task).toBeNull();
    expect(buildTimeEntryPayload({ ...base }).task).toBeNull();
  });

  it("sends task: null for the explicit 'No task' option", () => {
    expect(buildTimeEntryPayload({ ...base, taskId: NO_TASK }).task).toBeNull();
  });

  it("sends the numeric task id when a task is selected", () => {
    expect(buildTimeEntryPayload({ ...base, taskId: "42" }).task).toBe(42);
  });

  it("never sends NaN for a malformed task id", () => {
    expect(buildTimeEntryPayload({ ...base, taskId: "abc" }).task).toBeNull();
  });

  it("includes the description when provided", () => {
    expect(
      buildTimeEntryPayload({ ...base, taskId: "42", description: "Sprint work" }).description
    ).toBe("Sprint work");
  });
});

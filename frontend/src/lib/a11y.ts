import type { KeyboardEvent } from "react";

/**
 * Keyboard activation for clickable non-button elements (e.g. a <div> with
 * role="button"). Fires the element's own click on Enter/Space so the
 * existing onClick handler is reused. See SonarQube S1082.
 */
export function activateOnKey(e: KeyboardEvent<HTMLElement>) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    e.currentTarget.click();
  }
}

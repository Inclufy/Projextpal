import { createContext, useContext, useState, ReactNode } from "react";

type CopilotTab = "chat" | "guide";

/** The project a copilot session is scoped to, so its messages carry context. */
export type CopilotProject = { id: string | number; name?: string } | null;

/** The programme a copilot session is scoped to (mirrors CopilotProject). */
export type CopilotProgram = { id: string | number; name?: string } | null;

/** A message queued for the chat when it opens: prefilled, or auto-sent. */
export type PendingMessage = { text: string; autoSend?: boolean } | null;

type OpenForProjectOpts = { tab?: CopilotTab; prompt?: string; autoSend?: boolean };
type OpenForProgramOpts = { tab?: CopilotTab; prompt?: string; autoSend?: boolean };

interface CopilotContextType {
  isOpen: boolean;
  requestedTab: CopilotTab;
  activeProject: CopilotProject;
  activeProgram: CopilotProgram;
  pendingMessage: PendingMessage;
  toggle: () => void;
  open: () => void;
  close: () => void;
  openWithTab: (tab: CopilotTab) => void;
  setActiveProject: (project: CopilotProject) => void;
  setActiveProgram: (program: CopilotProgram) => void;
  consumePendingMessage: () => PendingMessage;
  /** Open the copilot scoped to a project (used by the per-project button and
   * the dashboard "pick up with AI" actions). */
  openForProject: (project: CopilotProject, opts?: OpenForProjectOpts) => void;
  /** Open the copilot scoped to a programme (mirrors openForProject). */
  openForProgram: (program: CopilotProgram, opts?: OpenForProgramOpts) => void;
}

const CopilotContext = createContext<CopilotContextType>({
  isOpen: false,
  requestedTab: "chat",
  activeProject: null,
  activeProgram: null,
  pendingMessage: null,
  toggle: () => {},
  open: () => {},
  close: () => {},
  openWithTab: () => {},
  setActiveProject: () => {},
  setActiveProgram: () => {},
  consumePendingMessage: () => null,
  openForProject: () => {},
  openForProgram: () => {},
});

export const useCopilot = () => useContext(CopilotContext);

export const CopilotProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [requestedTab, setRequestedTab] = useState<CopilotTab>("chat");
  const [activeProject, setActiveProject] = useState<CopilotProject>(null);
  const [activeProgram, setActiveProgram] = useState<CopilotProgram>(null);
  const [pendingMessage, setPendingMessage] = useState<PendingMessage>(null);

  return (
    <CopilotContext.Provider
      value={{
        isOpen,
        requestedTab,
        activeProject,
        activeProgram,
        pendingMessage,
        toggle: () => setIsOpen((prev) => !prev),
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        openWithTab: (tab: CopilotTab) => {
          setRequestedTab(tab);
          setIsOpen(true);
        },
        setActiveProject,
        setActiveProgram,
        consumePendingMessage: () => {
          const m = pendingMessage;
          setPendingMessage(null);
          return m;
        },
        openForProject: (project: CopilotProject, opts: OpenForProjectOpts = {}) => {
          // A project-scoped turn clears any active programme so context is unambiguous.
          setActiveProject(project);
          setActiveProgram(null);
          setRequestedTab(opts.tab ?? "chat");
          if (opts.prompt) setPendingMessage({ text: opts.prompt, autoSend: opts.autoSend });
          setIsOpen(true);
        },
        openForProgram: (program: CopilotProgram, opts: OpenForProgramOpts = {}) => {
          setActiveProgram(program);
          setActiveProject(null);
          setRequestedTab(opts.tab ?? "chat");
          if (opts.prompt) setPendingMessage({ text: opts.prompt, autoSend: opts.autoSend });
          setIsOpen(true);
        },
      }}
    >
      {children}
    </CopilotContext.Provider>
  );
};

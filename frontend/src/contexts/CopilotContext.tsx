import { createContext, useContext, useState, ReactNode } from "react";

type CopilotTab = "chat" | "guide";

/** The project a copilot session is scoped to, so its messages carry context. */
export type CopilotProject = { id: string | number; name?: string } | null;

interface CopilotContextType {
  isOpen: boolean;
  requestedTab: CopilotTab;
  activeProject: CopilotProject;
  toggle: () => void;
  open: () => void;
  close: () => void;
  openWithTab: (tab: CopilotTab) => void;
  setActiveProject: (project: CopilotProject) => void;
  /** Open the copilot scoped to a project (used by the per-project button). */
  openForProject: (project: CopilotProject, tab?: CopilotTab) => void;
}

const CopilotContext = createContext<CopilotContextType>({
  isOpen: false,
  requestedTab: "chat",
  activeProject: null,
  toggle: () => {},
  open: () => {},
  close: () => {},
  openWithTab: () => {},
  setActiveProject: () => {},
  openForProject: () => {},
});

export const useCopilot = () => useContext(CopilotContext);

export const CopilotProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [requestedTab, setRequestedTab] = useState<CopilotTab>("chat");
  const [activeProject, setActiveProject] = useState<CopilotProject>(null);

  return (
    <CopilotContext.Provider
      value={{
        isOpen,
        requestedTab,
        activeProject,
        toggle: () => setIsOpen((prev) => !prev),
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        openWithTab: (tab: CopilotTab) => {
          setRequestedTab(tab);
          setIsOpen(true);
        },
        setActiveProject,
        openForProject: (project: CopilotProject, tab: CopilotTab = "chat") => {
          setActiveProject(project);
          setRequestedTab(tab);
          setIsOpen(true);
        },
      }}
    >
      {children}
    </CopilotContext.Provider>
  );
};

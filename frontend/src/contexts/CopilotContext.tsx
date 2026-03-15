import { createContext, useContext, useState, ReactNode } from "react";

type CopilotTab = "chat" | "guide";

interface CopilotContextType {
  isOpen: boolean;
  requestedTab: CopilotTab;
  toggle: () => void;
  open: () => void;
  close: () => void;
  openWithTab: (tab: CopilotTab) => void;
}

const CopilotContext = createContext<CopilotContextType>({
  isOpen: false,
  requestedTab: "chat",
  toggle: () => {},
  open: () => {},
  close: () => {},
  openWithTab: () => {},
});

export const useCopilot = () => useContext(CopilotContext);

export const CopilotProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [requestedTab, setRequestedTab] = useState<CopilotTab>("chat");

  return (
    <CopilotContext.Provider
      value={{
        isOpen,
        requestedTab,
        toggle: () => setIsOpen((prev) => !prev),
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        openWithTab: (tab: CopilotTab) => {
          setRequestedTab(tab);
          setIsOpen(true);
        },
      }}
    >
      {children}
    </CopilotContext.Provider>
  );
};

import { createContext, useContext, useState, ReactNode } from "react";

interface CopilotContextType {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

const CopilotContext = createContext<CopilotContextType>({
  isOpen: false,
  toggle: () => {},
  open: () => {},
  close: () => {},
});

export const useCopilot = () => useContext(CopilotContext);

export const CopilotProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CopilotContext.Provider
      value={{
        isOpen,
        toggle: () => setIsOpen((prev) => !prev),
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </CopilotContext.Provider>
  );
};

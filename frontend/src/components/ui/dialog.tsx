import * as React from "react";
import { cn } from "@/lib/utils";

// Dialog context for open/close state
const DialogContext = React.createContext();

export function Dialog({ open, onOpenChange, children }) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children }) {
  const { onOpenChange } = React.useContext(DialogContext);
  return React.cloneElement(children, {
    onClick: (e) => {
      if (children.props.onClick) children.props.onClick(e);
      onOpenChange(true);
    },
  });
}

export function DialogContent({ children, className }) {
  const { open, onOpenChange } = React.useContext(DialogContext);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={cn("bg-background rounded-lg shadow-lg p-6 w-full max-w-md", className)}>
        {children}
        <button
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          onClick={() => onOpenChange(false)}
          aria-label="Close dialog"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function DialogHeader({ children, className }) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function DialogFooter({ children, className }) {
  return <div className={cn("mt-6 flex justify-end gap-2", className)}>{children}</div>;
}

export function DialogTitle({ children, className }) {
  return <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>;
}

export function DialogDescription({ children, className }) {
  return <p className={cn("text-sm text-muted-foreground mt-2", className)}>{children}</p>;
} 
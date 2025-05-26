import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Dialog context value type.
 */
type DialogContextValue = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue>({});

/**
 * Dialog root component providing context for open state and change handler.
 * @param open - Whether the dialog is open
 * @param onOpenChange - Handler to change open state
 * @param children - Dialog content
 */
export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}
export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

/**
 * DialogTrigger component to open the dialog.
 * @param children - The trigger element
 */
export interface DialogTriggerProps {
  children: React.ReactElement<any>;
}
export function DialogTrigger({ children }: DialogTriggerProps) {
  const { onOpenChange } = React.useContext(DialogContext);
  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      const childProps = children.props as any;
      if (childProps.onClick) childProps.onClick(e);
      onOpenChange && onOpenChange(true);
    },
  });
}

/**
 * DialogContent component for the dialog body.
 * @param children - Dialog content
 * @param className - Additional CSS classes
 */
export interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}
export function DialogContent({ children, className }: DialogContentProps) {
  const { open, onOpenChange } = React.useContext(DialogContext);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className={cn(
          "bg-background rounded-lg shadow-lg p-6 w-full max-w-md",
          className
        )}
      >
        {children}
        <button
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          onClick={() => onOpenChange && onOpenChange(false)}
          aria-label="Close dialog"
        >
          ×
        </button>
      </div>
    </div>
  );
}

/**
 * DialogHeader component for dialog headers.
 * @param children - Header content
 * @param className - Additional CSS classes
 */
export interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}
export function DialogHeader({ children, className }: DialogHeaderProps) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

/**
 * DialogFooter component for dialog footers.
 * @param children - Footer content
 * @param className - Additional CSS classes
 */
export interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}
export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div className={cn("mt-6 flex justify-end gap-2", className)}>
      {children}
    </div>
  );
}

/**
 * DialogTitle component for dialog titles.
 * @param children - Title content
 * @param className - Additional CSS classes
 */
export interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}
export function DialogTitle({ children, className }: DialogTitleProps) {
  return <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>;
}

/**
 * DialogDescription component for dialog descriptions.
 * @param children - Description content
 * @param className - Additional CSS classes
 */
export interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}
export function DialogDescription({
  children,
  className,
}: DialogDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground mt-2", className)}>
      {children}
    </p>
  );
}

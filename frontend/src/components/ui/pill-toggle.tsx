import * as React from "react";

/**
 * Simple pill-shaped toggle button used to switch boolean states.
 */
export interface PillToggleProps {
  active: boolean;
  onClick: (value: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function PillToggle({
  active,
  onClick,
  disabled,
  children,
}: PillToggleProps) {
  return (
    <button
      type="button"
      role="button"
      aria-pressed={active}
      disabled={disabled}
      tabIndex={0}
      onClick={() => !disabled && onClick(!active)}
      className={`
        px-3 py-1 text-sm sm:px-4 sm:text-base rounded-full font-medium transition
        ${
          active
            ? "bg-primary text-white shadow"
            : "bg-muted text-foreground border border-border"
        }
        ${
          disabled
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer hover:shadow-md"
        }
        focus:outline-none focus:ring-2 focus:ring-primary/60
      `}
    >
      {children}
    </button>
  );
}

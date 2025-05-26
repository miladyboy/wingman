import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { buttonVariants } from "./buttonUtils";

import { cn } from "@/lib/utils";

/**
 * Button component supporting variants, sizes, and asChild rendering.
 * Accepts all standard button props plus custom variant, size, and asChild.
 *
 * @param className - Additional CSS classes
 * @param variant - Visual style variant
 * @param size - Button size
 * @param asChild - Render as child component (Slot) instead of <button>
 * @param props - All other button props
 * @returns A styled button or Slot component
 */
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

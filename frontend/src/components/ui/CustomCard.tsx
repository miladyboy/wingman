import React from "react";

/**
 * CustomCard component props interface.
 */
export interface CustomCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Content of the card */
  children: React.ReactNode;
  /** Additional classes for customization */
  className?: string;
  /** Whether to apply glassmorphism effect */
  glass?: boolean;
  /** Color of the bottom border */
  borderColor?: string;
  /** Whether to apply hover effect */
  hoverEffect?: boolean;
  /** Whether to use compact padding */
  compact?: boolean;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

/**
 * CustomCard — Reusable base component for cards with glassmorphism, custom borders, hover and custom styles.
 * Allows maintaining visual consistency and flexibility in landing and other sections.
 */
function CustomCard({
  children,
  className = "",
  glass = true,
  borderColor = "#FFA726",
  hoverEffect = false,
  compact = false,
  style = {},
  ...rest
}: CustomCardProps) {
  // Log for rendering monitoring
  React.useEffect(() => {
    console.log("[CustomCard] Rendered", {
      glass,
      borderColor,
      hoverEffect,
      compact,
    });
  }, [glass, borderColor, hoverEffect, compact]);

  return (
    <div
      className={`rounded-2xl shadow-lg border ${
        glass ? "backdrop-blur-xl bg-white/10" : "bg-[#23284A]/80"
      } ${compact ? "p-6 md:py-8 md:px-10" : "p-8 md:p-12"} ${
        hoverEffect
          ? "transition-transform duration-200 hover:scale-105 hover:shadow-2xl"
          : ""
      } border-b-4 ${className}`}
      style={{
        borderBottomColor: borderColor,
        boxShadow: glass ? "0 8px 40px 0 rgba(44, 24, 80, 0.18)" : undefined,
        ...style,
      }}
      tabIndex={0}
      {...rest}
    >
      {children}
    </div>
  );
}

export default CustomCard;

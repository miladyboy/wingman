/**
 * LoadingDots — Animated loading indicator with three pulsing dots.
 * Uses the dot-pulse animation defined in Tailwind config.
 */
const LoadingDots = () => (
  <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
    <span className="h-2 w-2 rounded-full bg-current animate-dot-pulse [animation-delay:0s]"></span>
    <span className="h-2 w-2 rounded-full bg-current animate-dot-pulse [animation-delay:0.2s]"></span>
    <span className="h-2 w-2 rounded-full bg-current animate-dot-pulse [animation-delay:0.4s]"></span>
  </div>
);

export default LoadingDots; 
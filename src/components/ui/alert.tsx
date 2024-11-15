import * as React from "react";
import { cn } from "../../lib/utils";
import { AlertProps } from "../../types/renderer";

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4",
        {
          "bg-background text-foreground": variant === "default",
          "border-info/50 text-info dark:border-info": variant === "info",
        },
        className
      )}
      {...props}
    />
  )
);
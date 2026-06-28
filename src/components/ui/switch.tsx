import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "../../lib/cn"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    ref={ref}
    className={cn(
      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
      "bg-gray-300 data-[state=checked]:bg-primary",
      className
    )}
    {...props}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform",
        "data-[state=checked]:translate-x-[20px]"
      )}
    />
  </SwitchPrimitives.Root>
))

Switch.displayName = "Switch"

export { Switch }
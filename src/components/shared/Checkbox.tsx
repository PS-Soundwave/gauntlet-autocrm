import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import * as React from "react";
import { cn } from "@/lib/utils";

type CheckboxProps = React.ComponentPropsWithoutRef<
    typeof CheckboxPrimitive.Root
>;

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
    ({ className, ...props }, ref) => (
        <CheckboxPrimitive.Root
            ref={ref}
            className={cn(
                "flex h-5 w-5 items-center justify-center rounded-md border-2 border-gray-400 bg-white transition-colors hover:border-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-black data-[state=checked]:bg-black",
                className
            )}
            {...props}
        >
            <CheckboxPrimitive.Indicator className="text-white">
                <CheckIcon className="h-4 w-4" />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    )
);

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export default Checkbox;

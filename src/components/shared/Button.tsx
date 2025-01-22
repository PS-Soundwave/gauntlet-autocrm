import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    isLoading?: boolean;
    loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            asChild = false,
            className,
            isLoading = false,
            loadingText = "Loading...",
            children,
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md bg-black px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    className
                )}
                ref={ref}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? loadingText : children}
            </Comp>
        );
    }
);
Button.displayName = "Button";

export { Button };

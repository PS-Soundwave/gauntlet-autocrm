import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };

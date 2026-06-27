import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-violet-600 text-white",
        secondary: "border-transparent bg-stone-800 text-stone-200",
        destructive: "border-transparent bg-red-700 text-white",
        outline: "border-stone-700 text-stone-300",
        blocker: "border-transparent bg-red-900 text-red-200",
        high: "border-transparent bg-orange-900 text-orange-200",
        medium: "border-transparent bg-yellow-900 text-yellow-200",
        low: "border-transparent bg-stone-800 text-stone-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

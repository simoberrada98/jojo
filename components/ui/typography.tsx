import * as React from "react";
import { cn } from "@/lib/utils";

function H1({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "font-bold text-4xl lg:text-5xl tracking-tight scroll-m-20",
        className
      )}
      {...props}
    />
  );
}

function H2({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "font-bold text-3xl lg:text-4xl tracking-tight scroll-m-20",
        className
      )}
      {...props}
    />
  );
}

function H3({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "font-semibold text-2xl lg:text-3xl tracking-tight scroll-m-20",
        className
      )}
      {...props}
    />
  );
}

function H4({ className, ...props }: React.ComponentProps<"h4">) {
  return (
    <h4
      className={cn(
        "font-semibold text-xl lg:text-2xl tracking-tight scroll-m-20",
        className
      )}
      {...props}
    />
  );
}

function P({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("not-first:mt-6 leading-7", className)} {...props} />;
}

function Lead({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-muted-foreground text-xl", className)} {...props} />
  );
}

function Large({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("font-semibold text-lg", className)} {...props} />;
}

function Small({ className, ...props }: React.ComponentProps<"small">) {
  return (
    <small
      className={cn("font-medium text-sm leading-none", className)}
      {...props}
    />
  );
}

function Muted({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-muted-foreground text-sm", className)} {...props} />
  );
}

export { H1, H2, H3, H4, P, Lead, Large, Small, Muted };

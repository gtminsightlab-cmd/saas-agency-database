import { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Max-width content chrome WITHOUT vertical padding. Use this when you need the
 * 1120px max-width + horizontal padding outside of a Section (e.g., a narrow
 * sub-component that's already inside another container). Section already
 * includes its own Container.
 */
export function Container({ children, className }: ContainerProps) {
  return (
    <div className={`mx-auto max-w-6xl px-6 md:px-8 ${className ?? ""}`}>
      {children}
    </div>
  );
}

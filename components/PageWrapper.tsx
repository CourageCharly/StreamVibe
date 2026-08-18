import type { ReactNode } from "react";
import { cn } from "@/lib";

type Props = {
  children: ReactNode;
  className?: string;
};

const PageWrapper = ({ children, className }: Props) => {
  return <div className={cn("width-layout", className)}>{children}</div>;
};

export default PageWrapper;

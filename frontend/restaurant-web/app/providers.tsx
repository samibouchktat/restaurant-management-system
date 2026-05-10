"use client";

import { ReactNode } from "react";
import { QueryProvider } from "@/lib/query-client";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return <QueryProvider>{children}</QueryProvider>;
}
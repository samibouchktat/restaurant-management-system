"use client";

import { useQuery } from "@tanstack/react-query";
import { getPublicMenu } from "./public-menu.api";

export const publicMenuQueryKeys = {
  menu: ["public-menu"] as const,
};

export function usePublicMenu() {
  return useQuery({
    queryKey: publicMenuQueryKeys.menu,
    queryFn: getPublicMenu,
  });
}
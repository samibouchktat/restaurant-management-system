"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login } from "./auth.api";
import { saveAuthSession } from "@/lib/auth";
import { getApiErrorMessage } from "@/lib/api";
import type { LoginRequest, LoginResponse } from "@/types/auth";

function getRedirectPath(userRole: LoginResponse["user"]["role"]) {
  switch (userRole) {
    case "ADMIN":
    case "GERANT":
      return "/dashboard";

    case "CAISSIER":
      return "/cashier/invoices";

    case "SERVEUR":
      return "/dashboard/tables";

    default:
      return "/login";
  }
}

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (request: LoginRequest) => login(request),
    onSuccess: (data) => {
      saveAuthSession(data.accessToken, data.user);
      router.push(getRedirectPath(data.user.role));
    },
    onError: (error) => {
      console.error(getApiErrorMessage(error));
    },
  });
}
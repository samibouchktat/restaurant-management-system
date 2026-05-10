"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, getAuthUser } from "@/lib/auth";
import type { UserRole } from "@/types/auth";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: UserRole[];
};

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    const user = getAuthUser();

    if (!token || !user) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace("/login");
      return;
    }

    setIsChecking(false);
  }, [router, allowedRoles]);

  if (isChecking) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">Vérification de la session...</p>
      </main>
    );
  }

  return <>{children}</>;
}
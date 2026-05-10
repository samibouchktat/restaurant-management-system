import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function DashboardRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "GERANT", "SERVEUR"]}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function CashierLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "GERANT", "CAISSIER"]}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}   
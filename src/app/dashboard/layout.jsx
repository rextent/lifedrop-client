import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardAuthGuard from "@/components/dashboard/DashboardAuthGuard";

export default function DashboardLayout({ children }) {
  return (
    <DashboardAuthGuard>
      <DashboardSidebar>{children}</DashboardSidebar>
    </DashboardAuthGuard>
  );
}
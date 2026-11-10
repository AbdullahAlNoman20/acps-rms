import DashboardLayout from "../../../../Components/layout/DashboardLayout";
import { NAV } from "../../../../Components/constants/navigation";

export default function StudentLayout() {
  return <DashboardLayout nav={NAV.student} bottom="student" base="/app/student" />;
}

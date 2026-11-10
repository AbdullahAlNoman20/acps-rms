import DashboardLayout from "../../../../Components/layout/DashboardLayout";
import { NAV } from "../../../../Components/constants/navigation";

export default function TeacherLayout() {
  return <DashboardLayout nav={NAV.teacher} bottom="teacher" base="/app/teacher" />;
}

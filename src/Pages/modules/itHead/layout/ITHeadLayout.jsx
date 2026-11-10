import DashboardLayout from "../../../../Components/layout/DashboardLayout";
import { NAV } from "../../../../Components/constants/navigation";

export default function ITHeadLayout() {
  return <DashboardLayout nav={NAV.itHead} bottom="itHead" base="/app/it-head" />;
}

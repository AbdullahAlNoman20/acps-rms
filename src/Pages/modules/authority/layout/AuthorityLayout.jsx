import DashboardLayout from "../../../../Components/layout/DashboardLayout";
import { NAV } from "../../../../Components/constants/navigation";

export default function AuthorityLayout() {
  return <DashboardLayout nav={NAV.authority} bottom="authority" base="/app/authority" />;
}

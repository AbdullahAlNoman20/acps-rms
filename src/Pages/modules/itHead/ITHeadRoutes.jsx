import { Navigate } from "react-router-dom";
import ITHeadDashboard from "./pages/ITHeadDashboard";
import StudentImportPage from "./pages/StudentImportPage";
import AssignCurriculumPage from "./pages/AssignCurriculumPage";
import ExamsPage from "../../common/ExamsPage";
import ExamDetailPage from "../../common/ExamDetailPage";
import ResultsPage from "../../common/ResultsPage";
import ResultViewPage from "../../common/ResultViewPage";
import ReportsHub from "../../common/ReportsHub";
import ReportRunner from "../../common/ReportRunner";
import SscPage from "../../common/SscPage";
import YearEndPage from "../../common/YearEndPage";
import ExtensionsPage from "../../common/ExtensionsPage";
import CorrectionsPage from "../../common/CorrectionsPage";
import GracePage from "../../common/GracePage";
import SpecialPassPage from "../../common/SpecialPassPage";
import SetupHub from "../../common/SetupHub";
import RulesPage from "../../common/RulesPage";
import LabelsPage from "../../common/LabelsPage";
import PermissionsPage from "../../common/PermissionsPage";
import SmsPage from "../../common/SmsPage";
import TicketsPage from "../../common/TicketsPage";
import TicketNewPage from "../../common/TicketNewPage";
import TicketDetailPage from "../../common/TicketDetailPage";
import AuditPage from "../../common/AuditPage";
import SettingsPage from "../../common/SettingsPage";
import CrudPage from "../../../Components/Shared/CrudPage";
import PermissionGate from "../../../Components/Shared/PermissionGate";

const gate = (perm, el) => <PermissionGate perm={perm} showNote>{el}</PermissionGate>;

const ITHeadRoutes = [
  { index: true, element: <Navigate to="dashboard" replace /> },
  { path: "dashboard", element: <ITHeadDashboard /> },
  { path: "exams", element: <ExamsPage /> }, { path: "exams/:id", element: <ExamDetailPage /> },
  { path: "results", element: <ResultsPage /> }, { path: "results/view/:studentId/:scope", element: <ResultViewPage /> },
  { path: "reports", element: <ReportsHub /> }, { path: "reports/:type", element: <ReportRunner /> },
  { path: "ssc", element: <SscPage /> }, { path: "year-end", element: gate("yearend.prepare", <YearEndPage />) },
  { path: "extensions", element: <ExtensionsPage /> }, { path: "corrections", element: <CorrectionsPage /> },
  { path: "grace", element: <GracePage /> }, { path: "special-pass", element: <SpecialPassPage /> },
  { path: "students/import", element: gate("students.manage", <StudentImportPage />) },
  { path: "students/curriculum", element: gate("students.manage", <AssignCurriculumPage />) },
  { path: "data/:entity", element: <CrudPage /> }, { path: "data/:entity/:id", element: <CrudPage /> },
  { path: "setup", element: <SetupHub /> },
  { path: "rules", element: gate("customize.manage", <RulesPage />) }, { path: "labels", element: gate("customize.manage", <LabelsPage />) },
  { path: "permissions", element: gate("permissions.manage", <PermissionsPage />) },
  { path: "sms", element: <SmsPage /> },
  { path: "support", element: <TicketsPage /> }, { path: "support/new", element: <TicketNewPage /> }, { path: "support/:id", element: <TicketDetailPage /> },
  { path: "audit", element: gate("audit.view", <AuditPage />) }, { path: "settings", element: <SettingsPage /> },
];
export default ITHeadRoutes;

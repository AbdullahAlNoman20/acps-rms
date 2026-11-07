import { Navigate } from "react-router-dom";
import TeacherDashboard from "./pages/TeacherDashboard";
import EntryListPage from "./pages/EntryListPage";
import EntryGridPage from "./pages/EntryGridPage";
import AttendancePage from "./pages/AttendancePage";
import ExtensionsPage from "../../common/ExtensionsPage";
import ExtensionNewPage from "../../common/ExtensionNewPage";
import CorrectionsPage from "../../common/CorrectionsPage";
import CorrectionNewPage from "../../common/CorrectionNewPage";
import ResultsPage from "../../common/ResultsPage";
import ResultViewPage from "../../common/ResultViewPage";
import ReportsHub from "../../common/ReportsHub";
import ReportRunner from "../../common/ReportRunner";
import SmsPage from "../../common/SmsPage";
import TicketsPage from "../../common/TicketsPage";
import TicketNewPage from "../../common/TicketNewPage";
import TicketDetailPage from "../../common/TicketDetailPage";
import SettingsPage from "../../common/SettingsPage";

const TeacherRoutes = [
  { index: true, element: <Navigate to="dashboard" replace /> },
  { path: "dashboard", element: <TeacherDashboard /> },
  { path: "entry", element: <EntryListPage /> }, { path: "entry/:examId/:batchId", element: <EntryGridPage /> },
  { path: "attendance", element: <AttendancePage /> },
  { path: "extension", element: <ExtensionsPage /> }, { path: "extension/new", element: <ExtensionNewPage /> },
  { path: "corrections", element: <CorrectionsPage /> }, { path: "corrections/new", element: <CorrectionNewPage /> },
  { path: "my-class", element: <ResultsPage /> }, { path: "results/view/:studentId/:scope", element: <ResultViewPage /> },
  { path: "reports", element: <ReportsHub /> }, { path: "reports/:type", element: <ReportRunner /> },
  { path: "sms", element: <SmsPage /> },
  { path: "support", element: <TicketsPage /> }, { path: "support/new", element: <TicketNewPage /> }, { path: "support/:id", element: <TicketDetailPage /> },
  { path: "settings", element: <SettingsPage /> },
];
export default TeacherRoutes;

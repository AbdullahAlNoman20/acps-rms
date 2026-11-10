import { Navigate } from "react-router-dom";
import AuthorityDashboard from "./pages/AuthorityDashboard";
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
import SmsPage from "../../common/SmsPage";
import TicketsPage from "../../common/TicketsPage";
import TicketNewPage from "../../common/TicketNewPage";
import TicketDetailPage from "../../common/TicketDetailPage";
import AuditPage from "../../common/AuditPage";
import SettingsPage from "../../common/SettingsPage";
import CrudPage from "../../../Components/Shared/CrudPage";

import ClassesPage from "../../common/ClassesPage";
import ClassDetailPage from "../../common/ClassDetailPage";
import StudentDetailPage from "../../common/StudentDetailPage";
import GuidePage from "../../common/GuidePage";
import HubPage from "../../common/HubPage";
const AuthorityRoutes = [
  { index: true, element: <Navigate to="dashboard" replace /> },
  { path: "dashboard", element: <AuthorityDashboard /> },
  { path: "exams", element: <ExamsPage /> }, { path: "exams/:id", element: <ExamDetailPage /> },
  { path: "results", element: <ResultsPage /> }, { path: "results/view/:studentId/:scope", element: <ResultViewPage /> },
  { path: "reports", element: <ReportsHub /> }, { path: "reports/:type", element: <ReportRunner /> },
  { path: "ssc", element: <SscPage /> }, { path: "year-end", element: <YearEndPage /> },
  { path: "extensions", element: <ExtensionsPage /> }, { path: "corrections", element: <CorrectionsPage /> },
  { path: "grace", element: <GracePage /> }, { path: "special-pass", element: <SpecialPassPage /> },
  { path: "data/:entity", element: <CrudPage /> }, { path: "data/:entity/:id", element: <CrudPage /> },
  { path: "sms", element: <SmsPage /> }, { path: "audit", element: <AuditPage /> },
  { path: "support", element: <TicketsPage /> }, { path: "support/new", element: <TicketNewPage /> }, { path: "support/:id", element: <TicketDetailPage /> },
  { path: "settings", element: <SettingsPage /> },
  { path: "classes", element: <ClassesPage /> }, { path: "classes/:program", element: <ClassDetailPage /> }, { path: "students/:id", element: <StudentDetailPage /> },
  { path: "approvals", element: <HubPage hub="approvals" title="Approvals" /> }, { path: "guide", element: <GuidePage /> },
];
export default AuthorityRoutes;

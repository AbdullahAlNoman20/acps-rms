import { Navigate } from "react-router-dom";
import StudentDashboard from "./pages/StudentDashboard";
import StudentResultsPage from "./pages/StudentResultsPage";
import StudentResultPage from "./pages/StudentResultPage";
import StudentSscPage from "./pages/StudentSscPage";
import StudentContactPage from "./pages/StudentContactPage";
import TicketsPage from "../../common/TicketsPage";
import TicketNewPage from "../../common/TicketNewPage";
import TicketDetailPage from "../../common/TicketDetailPage";
import SettingsPage from "../../common/SettingsPage";

const StudentRoutes = [
  { index: true, element: <Navigate to="dashboard" replace /> },
  { path: "dashboard", element: <StudentDashboard /> },
  { path: "results", element: <StudentResultsPage /> }, { path: "results/:scope", element: <StudentResultPage /> },
  { path: "ssc", element: <StudentSscPage /> }, { path: "contact", element: <StudentContactPage /> },
  { path: "support", element: <TicketsPage /> }, { path: "support/new", element: <TicketNewPage /> }, { path: "support/:id", element: <TicketDetailPage /> },
  { path: "settings", element: <SettingsPage /> },
];
export default StudentRoutes;

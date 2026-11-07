// Route map. Each role has its own module folder under Pages/modules/<module>/ with its own layout and routes.
import { createBrowserRouter, Navigate } from "react-router-dom";

import Root from "./Root";
import Home from "./Pages/Home/Home";
import Login from "./Pages/Login/Login";
import Unauthorized from "./Components/Shared/Unauthorized";
import NotFound from "./Components/Shared/NotFound";
import RoleRoute from "./Components/Shared/RoleRoute";
import { MODULE_ROLES } from "./Components/constants/roles";

import ITHeadLayout from "./Pages/modules/itHead/layout/ITHeadLayout";
import ITHeadRoutes from "./Pages/modules/itHead/ITHeadRoutes";
import TeacherLayout from "./Pages/modules/teacher/layout/TeacherLayout";
import TeacherRoutes from "./Pages/modules/teacher/TeacherRoutes";
import AuthorityLayout from "./Pages/modules/authority/layout/AuthorityLayout";
import AuthorityRoutes from "./Pages/modules/authority/AuthorityRoutes";
import StudentLayout from "./Pages/modules/student/layout/StudentLayout";
import StudentRoutes from "./Pages/modules/student/StudentRoutes";

const guard = (roles, el) => <RoleRoute allowedRoles={roles}>{el}</RoleRoute>;

export const routes = [
  { path: "/", element: <Root />, children: [{ index: true, element: <Home /> }] },
  { path: "/login", element: <Login /> },
  { path: "/unauthorized", element: <Unauthorized /> },
  { path: "/app/it-head", element: guard(MODULE_ROLES.itHead, <ITHeadLayout />), children: ITHeadRoutes },
  { path: "/app/teacher", element: guard(MODULE_ROLES.teacher, <TeacherLayout />), children: TeacherRoutes },
  { path: "/app/authority", element: guard(MODULE_ROLES.authority, <AuthorityLayout />), children: AuthorityRoutes },
  { path: "/app/student", element: guard(MODULE_ROLES.student, <StudentLayout />), children: StudentRoutes },
  { path: "/app", element: <Navigate to="/login" replace /> },
  { path: "*", element: <NotFound /> },
];

const Router = createBrowserRouter(routes);

export default Router;

import { Outlet, ScrollRestoration } from "react-router-dom";

// Public layout (home page). Dashboard pages use DashboardLayout.
export default function Root() {
  return (<><ScrollRestoration /><Outlet /></>);
}

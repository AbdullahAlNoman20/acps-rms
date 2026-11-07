import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLE_HOME_ROUTE } from "../constants/roles";
import { FiLock } from "react-icons/fi";

export default function Unauthorized() {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <FiLock size={36} className="text-crimson-500" />
      <h1 className="text-xl font-bold text-ink-900">You do not have access to this page</h1>
      <p className="max-w-sm text-sm text-ink-500">This page is for another role. Please go back to your own dashboard.</p>
      <Link className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white" to={user ? ROLE_HOME_ROUTE[user.role] : "/login"}>Go to my dashboard</Link>
    </div>
  );
}

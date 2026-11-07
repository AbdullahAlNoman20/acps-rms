import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLogIn, FiUsers } from "react-icons/fi";
import logo from "../../assets/logo.png";
import { useAuth } from "../../Components/hooks/useAuth";
import { useToast } from "../../Components/hooks/useToast";
import { useCollection } from "../../Components/hooks/useCollection";
import { ROLE_HOME_ROUTE, ROLE_LABELS } from "../../Components/constants/roles";
import { DEMO_PASSWORD } from "../../config/appConfig";
import { ui } from "../../theme/ui";
import { FieldBlock } from "../../Components/Shared/FormFields";

export default function Login() {
  const { user, login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const location = useLocation();
  const { items: users } = useCollection("users");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={ROLE_HOME_ROUTE[user.role] || "/"} replace />;

  async function submit(e) {
    e.preventDefault();
    if (!form.email.trim() || !form.password) { setError("Please type your email and password."); return; }
    setBusy(true);
    const res = await login(form.email, form.password);
    setBusy(false);
    if (!res.success) { setError(res.message); return; }
    toast.push(`Welcome, ${res.user.name}`);
    nav(location.state?.from?.pathname || ROLE_HOME_ROUTE[res.user.role], { replace: true });
  }
  const demo = users.filter((u) => u.status === "Active" && !u.id.startsWith("U-T") || u.id === "U-T1");

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50 px-4 py-8">
      <div className="grid w-full max-w-4xl gap-5 md:grid-cols-2">
        <form onSubmit={submit} noValidate className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <img src={logo} alt="School logo" className="h-20 w-20 object-contain" />
            <h1 className="mt-3 text-lg font-bold text-ink-900">Adamjee Cantonment Public School</h1>
            <p className="text-sm text-ink-500">Result Management System</p>
          </div>
          <div className="space-y-4">
            <FieldBlock field={{ label: "Email" }}>
              <input type="email" autoComplete="username" className={ui.input} value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setError(""); }} placeholder="you@acps.edu.bd" />
            </FieldBlock>
            <FieldBlock field={{ label: "Password" }}>
              <div className="relative">
                <input type={show ? "text" : "password"} autoComplete="current-password" className={`${ui.input} pr-11`} value={form.password} onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(""); }} />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">{show ? <FiEyeOff /> : <FiEye />}</button>
              </div>
            </FieldBlock>
            {error && <p className={ui.error} role="alert">{error}</p>}
            <button type="submit" disabled={busy} className={`${ui.btnBase} ${ui.btn.primary} ${ui.btnSize.md} w-full`}><FiLogIn /> {busy ? "Signing in..." : "Sign in"}</button>
          </div>
        </form>
        <div className="rounded-2xl border-2 border-dashed border-gold-500/50 bg-white/80 p-5">
          <p className="mb-1 flex items-center gap-2 text-sm font-bold text-gold-600"><FiUsers /> Test accounts</p>
          <p className="mb-3 text-xs text-ink-500">Tap an account to fill the form. Password for all: <span className="font-mono font-semibold text-brand-700">{DEMO_PASSWORD}</span></p>
          <div className="space-y-2">
            {demo.map((u) => (
              <button key={u.id} type="button" onClick={() => { setForm({ email: u.email, password: DEMO_PASSWORD }); setError(""); }}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-ink-100 bg-white px-3 py-2 text-left hover:border-brand-300 hover:bg-brand-50">
                <span className="flex min-w-0 items-center gap-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: u.avatarColor }}>{u.name.charAt(0)}</span>
                  <span className="min-w-0"><span className="block truncate text-sm font-medium text-ink-900">{u.name}</span><span className="block text-xs text-ink-500">{ROLE_LABELS[u.role]}</span></span></span>
                <span className="hidden truncate text-xs text-ink-400 sm:block">{u.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

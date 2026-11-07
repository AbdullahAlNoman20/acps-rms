import { Link } from "react-router-dom";
import { FiLogIn, FiEdit3, FiShield, FiAward, FiSliders, FiArrowRight } from "react-icons/fi";
import logo from "../../assets/logo.png";
import { APP_FULL_NAME } from "../../config/appConfig";

const FEATURES = [
  { icon: FiEdit3, title: "Easy marks entry", text: "Teachers enter marks class by class inside a time window set by the IT Head." },
  { icon: FiAward, title: "Automatic results", text: "GPA, grade, merit position and transcript are calculated by the school's own rules." },
  { icon: FiShield, title: "Check and sign", text: "IT Head verifies, Principal and Vice Principal review and sign before publishing." },
  { icon: FiSliders, title: "Changeable by the school", text: "Marks, pass rules, formulas, labels and fields can be changed without a developer." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-cream-50">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3"><img src={logo} alt="School logo" className="h-12 w-12 object-contain" /><span className="text-sm font-bold text-ink-900">Adamjee Cantonment Public School</span></div>
        <Link to="/login" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"><FiLogIn /> Sign in</Link>
      </header>
      <section className="mx-auto max-w-3xl px-4 py-14 text-center">
        <img src={logo} alt="" className="mx-auto mb-5 h-28 w-28 object-contain" />
        <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">{APP_FULL_NAME}</h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-600">One place for marks entry, result calculation, approval and publishing for teachers, the IT Head, the Principal and students.</p>
        <Link to="/login" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">Go to sign in <FiArrowRight /></Link>
      </section>
      <section className="mx-auto grid max-w-5xl gap-4 px-4 pb-16 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-3 rounded-xl border border-ink-100 bg-white p-4 shadow-card">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icon /></span>
            <div><h3 className="font-semibold text-ink-900">{title}</h3><p className="mt-0.5 text-sm text-ink-500">{text}</p></div>
          </div>
        ))}
      </section>
    </div>
  );
}

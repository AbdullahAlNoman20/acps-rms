import { Link } from "react-router-dom";
import { FiLogIn, FiArrowRight, FiSmartphone, FiSliders, FiShield, FiGlobe, FiDatabase, FiCheckCircle } from "react-icons/fi";
import logo from "../../assets/logo.png";
import { BRAND, FEATURES } from "../../config/brand";

const STEPS = [["1", "Set up", "IT Head defines classes, subjects, marks and rules once."], ["2", "Enter marks", "Teachers type marks on their phone inside a set time."], ["3", "Check and sign", "IT Head verifies. Vice Principal and Principal review and sign."], ["4", "Publish", "Students and parents read, print or save the result."]];
const AUDIENCES = [
  ["For teachers", ["marksDesk", "attendanceBook", "extraTime", "correctionDesk"]],
  ["For the IT Head", ["teacherPlanner", "markBlueprint", "ruleStudio", "fieldBuilder", "easyImport", "nameStudio"]],
  ["For the Principal and Vice Principal", ["examJourney", "passSwitch", "promotionDesk", "changeTrail"]],
  ["For students and parents", ["myResults", "transcript", "parentConnect", "callSchool"]],
];
const WHY = [[FiSmartphone, "Made for phones", "Big buttons, simple pages and a bottom menu. A teacher can finish marks entry on a phone."], [FiSliders, "Change anything yourself", "Marks, pass rules, formulas, names and fields are edited by the IT Head. No developer needed."], [FiShield, "Safe and signed", "Two-step approvals, locked marks, digital signatures and a Change Trail kept for 5 years."], [FiGlobe, "English and Bangla", "Transcripts in both languages. Rename any menu in your own words."], [FiCheckCircle, "No surprises", "Every page says what to do next. A 'How to use' box explains each feature."], [FiDatabase, "Ready for the server", "Data layer is separate, so a backend can be connected without changing the screens."]];

export default function Home() {
  return (
    <div className="min-h-screen bg-cream-50 text-ink-800">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3"><img src={logo} alt="School logo" className="h-11 w-11 object-contain" /><div className="leading-tight"><p className="text-sm font-bold text-ink-900">{BRAND.name}</p><p className="text-[11px] text-ink-500">Adamjee Cantonment Public School</p></div></div>
        <Link to="/login" className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"><FiLogIn /> Sign in</Link>
      </header>
      <section className="mx-auto max-w-4xl px-4 py-12 text-center sm:py-16">
        <img src={logo} alt="" className="mx-auto mb-5 h-24 w-24 object-contain sm:h-28 sm:w-28" />
        <h1 className="text-3xl font-bold text-ink-900 sm:text-5xl">{BRAND.name}</h1>
        <p className="mt-3 text-lg font-medium text-brand-700">{BRAND.tagline}</p>
        <p className="mx-auto mt-3 max-w-2xl text-ink-600">{BRAND.promise}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/login" className="inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-brand-600 px-6 text-sm font-semibold text-white hover:bg-brand-700">Sign in <FiArrowRight /></Link>
          <a href="#features" className="inline-flex min-h-[48px] items-center rounded-lg border border-ink-200 bg-white px-6 text-sm font-semibold text-ink-700 hover:bg-ink-50">See what is inside</a>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="mb-5 text-center text-xl font-bold text-ink-900">How it works</h2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{STEPS.map(([n, t, d]) => (<li key={n} className="rounded-xl border border-ink-100 bg-white p-4 shadow-card"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-ink-900">{n}</span><p className="mt-2 font-semibold text-ink-900">{t}</p><p className="text-sm text-ink-500">{d}</p></li>))}</ol>
      </section>
      <section id="features" className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="mb-1 text-center text-xl font-bold text-ink-900">Features, named for what they do</h2>
        <p className="mb-6 text-center text-sm text-ink-500">Every feature has a clear name, a one-line promise and simple steps.</p>
        <div className="space-y-8">
          {AUDIENCES.map(([title, keys]) => (
            <div key={title}><h3 className="mb-3 text-sm font-bold text-brand-700">{title}</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{keys.map((k) => { const f = FEATURES[k]; const Icon = f.icon; return (
                <div key={k} className="flex gap-3 rounded-xl border border-ink-100 bg-white p-4 shadow-card"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icon size={20} /></span><div><p className="font-semibold text-ink-900">{f.name}</p><p className="text-sm text-ink-500">{f.tagline}</p></div></div>); })}</div></div>))}
        </div>
      </section>
      <section className="bg-brand-800 py-12 text-white">
        <div className="mx-auto max-w-6xl px-4"><h2 className="mb-6 text-center text-xl font-bold">Why {BRAND.short}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{WHY.map(([Icon, t, d]) => (<div key={t} className="rounded-xl bg-white/10 p-4"><Icon size={22} className="text-gold-500" /><p className="mt-2 font-semibold">{t}</p><p className="text-sm text-white/75">{d}</p></div>))}</div></div>
      </section>
      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-ink-500">{BRAND.name} - Adamjee Cantonment Public School, Dhaka Cantonment</footer>
    </div>
  );
}

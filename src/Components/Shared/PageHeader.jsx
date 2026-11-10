import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import { FEATURES, featureKeyForPath } from "../../config/brand";
import BackButton from "./BackButton";
import NoteBox from "./NoteBox";

const seenKey = (k) => `acps_rms:tip:${k}`;

// Shows the feature's brand name + tagline, the page title, and a "How to use" box that stays open until the user taps "Got it".
// The text comes from config/brand.js, so every page explains itself the same simple way.
export default function PageHeader({ title, subtitle, note, noteTitle, noteTone = "tip", actions, back = true, keepNote = false }) {
  const { pathname } = useLocation();
  const key = featureKeyForPath(pathname);
  const f = key && FEATURES[key]?.steps ? FEATURES[key] : null;
  const Icon = f?.icon;
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(!!f && !localStorage.getItem(seenKey(key))); }, [key, f]);
  const gotIt = () => { localStorage.setItem(seenKey(key), "1"); setOpen(false); };
  return (
    <div className="no-print mb-4 space-y-3">
      {back && <BackButton />}
      {f && (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold text-brand-700">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1"><Icon size={13} /> {f.name}</span>
          <span className="font-normal text-ink-500">{f.tagline}</span>
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0"><h1 className="text-xl font-bold text-ink-900 sm:text-2xl">{title}</h1>{subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}</div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {note && (!f || keepNote) && <NoteBox tone={noteTone} title={noteTitle}>{note}</NoteBox>}
      {f && (
        <div className="rounded-xl border border-brand-100 bg-brand-50/50">
          <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-semibold text-brand-800">
            <span>How to use {f.name}</span><FiChevronDown className={`transition ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <div className="space-y-3 border-t border-brand-100 px-3 py-3 text-sm text-ink-700">
              <p>{f.what}</p>
              <ol className="list-decimal space-y-1 pl-5">{f.steps.map((s) => <li key={s}>{s}</li>)}</ol>
              {f.nb && <p className="rounded-lg bg-white px-3 py-2 text-xs"><b className="text-crimson-600">NB:</b> {f.nb}</p>}
              <button type="button" onClick={gotIt} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white"><FiCheck /> Got it - hide tips</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

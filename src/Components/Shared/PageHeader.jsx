import BackButton from "./BackButton";
import NoteBox from "./NoteBox";

export default function PageHeader({ title, subtitle, note, noteTitle, noteTone = "tip", actions, back = true }) {
  return (
    <div className="no-print mb-4 space-y-3">
      {back && <BackButton />}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {note && <NoteBox tone={noteTone} title={noteTitle}>{note}</NoteBox>}
    </div>
  );
}

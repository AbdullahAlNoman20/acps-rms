import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { ENTITIES, ENTITY_GROUPS } from "../../Components/constants/entitySchemas";
import { useBasePath } from "../../Components/hooks/useBasePath";
import { useAuth } from "../../Components/hooks/useAuth";
import PageHeader from "../../Components/Shared/PageHeader";
import Card from "../../Components/Shared/Card";

export default function SetupHub() {
  const base = useBasePath(); const { can } = useAuth();
  return (
    <>
      <PageHeader title="All lists" note="Every list in the system can be opened, changed, added to and exported from here. Choose a list." />
      <div className="grid gap-4 lg:grid-cols-2">
        {ENTITY_GROUPS.map((g) => {
          const list = Object.entries(ENTITIES).filter(([, e]) => e.group === g && can(e.perm));
          if (!list.length) return null;
          return (
            <Card key={g} title={g}>
              <ul className="divide-y divide-ink-100">
                {list.map(([k, e]) => (<li key={k}><Link className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-brand-700" to={`${base}/data/${k}`}><span><b className="text-ink-900">{e.title}</b><span className="block text-xs text-ink-500">{e.note.split(".")[0]}.</span></span><FiChevronRight className="shrink-0 text-ink-300" /></Link></li>))}
              </ul>
            </Card>
          );
        })}
      </div>
    </>
  );
}

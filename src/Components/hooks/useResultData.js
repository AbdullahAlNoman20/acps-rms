import { useMemo } from "react";
import { useCollections } from "./useCollection";
import { buildCtx } from "../../engine/calc";

export const RESULT_COLLECTIONS = [
  "students", "markDistributions", "marks", "ruleParams", "ruleFormulas", "ruleConditions", "gradeTables", "statusCodes",
  "grace", "attendance", "exams", "examSchemes", "programs", "versions", "sections", "groups", "courses", "settings",
];

// One hook that gives any page everything it needs to calculate results.
export function useResultData(extra = []) {
  const { data, loading } = useCollections([...RESULT_COLLECTIONS, ...extra]);
  const ctx = useMemo(() => (loading ? null : buildCtx(data)), [data, loading]);
  return { data, ctx, loading };
}

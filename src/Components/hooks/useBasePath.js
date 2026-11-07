import { useLocation } from "react-router-dom";
// "/app/it-head/exams/2026-final" -> "/app/it-head". Shared pages use it to build links for any module.
export function useBasePath() {
  const { pathname } = useLocation();
  return pathname.split("/").slice(0, 3).join("/");
}

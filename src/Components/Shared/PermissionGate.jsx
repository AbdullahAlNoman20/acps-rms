import { useAuth } from "../hooks/useAuth";
import NoteBox from "./NoteBox";

// Wrap a page or button: shows it only when the signed-in role has the permission.
export default function PermissionGate({ perm, children, fallback = null, showNote = false }) {
  const { can } = useAuth();
  if (can(perm)) return children;
  return showNote ? <NoteBox tone="warning" title="You can only look at this page">Your role does not have permission to change this. Please ask the IT Head if you need access.</NoteBox> : fallback;
}

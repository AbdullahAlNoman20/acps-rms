import { useState } from "react";
import Button from "./Button";

// No pop-up: the button turns into "Are you sure? Yes / No" right where it is.
export default function ConfirmButton({ label = "Delete", confirmText = "Are you sure?", onConfirm, icon, variant = "danger", size = "sm", disabled }) {
  const [asking, setAsking] = useState(false);
  if (!asking) return <Button variant={variant === "danger" ? "secondary" : variant} size={size} icon={icon} disabled={disabled} onClick={() => setAsking(true)} className={variant === "danger" ? "text-crimson-600" : ""}>{label}</Button>;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 rounded-lg bg-crimson-50 px-2 py-1 text-xs">
      <span className="font-medium text-crimson-700">{confirmText}</span>
      <Button variant="danger" size="sm" onClick={() => { setAsking(false); onConfirm(); }}>Yes</Button>
      <Button variant="secondary" size="sm" onClick={() => setAsking(false)}>No</Button>
    </span>
  );
}

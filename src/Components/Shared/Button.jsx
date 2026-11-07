import { Link } from "react-router-dom";
import { ui } from "../../theme/ui";
import { cx } from "../utils/format";

export default function Button({ variant = "primary", size = "md", icon: Icon, to, children, className, type = "button", ...rest }) {
  const cls = cx(ui.btnBase, ui.btn[variant], ui.btnSize[size], className);
  const content = (<>{Icon && <Icon className="shrink-0" size={size === "sm" ? 14 : 16} />}{children}</>);
  if (to) return <Link to={to} className={cls} {...rest}>{content}</Link>;
  return <button type={type} className={cls} {...rest}>{content}</button>;
}

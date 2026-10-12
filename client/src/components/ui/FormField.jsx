import clsx from "clsx";
import { forwardRef } from "react";

const FormField = forwardRef(function FormField(
  {
    label,
    error,
    description,
    as = "input",
    className,
    inputClassName,
    icon,
    trailing,
    children,
    ...props
  },
  ref
) {
  const Component = as === "textarea" ? "textarea" : as === "select" ? "select" : "input";
  const hasIcon = Boolean(icon);
  const hasTrailing = Boolean(trailing);

  return (
    <label className={clsx("block", className)}>
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      {description ? <span className="mb-2 block text-xs text-muted">{description}</span> : null}
      <span className="relative block">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-muted">
            {icon}
          </span>
        ) : null}
        <Component
          ref={ref}
          className={clsx(
            "w-full rounded-3xl border border-line bg-canvas px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20",
            hasIcon && "pl-11",
            hasTrailing && "pr-12",
            as === "textarea" && "min-h-28 resize-y",
            inputClassName
          )}
          {...props}
        >
          {children}
        </Component>
        {trailing ? (
          <span className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-muted">{trailing}</span>
        ) : null}
      </span>
      {error ? <span className="mt-2 block text-xs font-medium text-[#C2410C]">{error}</span> : null}
    </label>
  );
});

export default FormField;

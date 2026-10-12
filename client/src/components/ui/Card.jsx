import clsx from "clsx";

export default function Card({ title, subtitle, actions, className, children }) {
  return (
    <section
      className={clsx(
        "print-card rounded-4xl border border-line bg-white/88 p-5 shadow-panel backdrop-blur-sm sm:p-6",
        className
      )}
    >
      {(title || subtitle || actions) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? <h3 className="text-xl font-bold text-ink">{title}</h3> : null}
            {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
          </div>
          {actions ? <div className="print-hidden">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}


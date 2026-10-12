import clsx from "clsx";
import { Armchair } from "lucide-react";

export default function Sidebar({ sections, activeSection, onSectionChange }) {
  return (
    <aside className="print-hidden fixed inset-y-0 left-0 hidden w-72 border-r border-white/60 bg-[#10304b] px-6 py-8 text-white lg:block">
      <div className="flex items-center gap-3">
        <div className="rounded-3xl bg-white/10 p-3">
          <Armchair className="h-6 w-6 text-accent" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/60">Admin Suite</p>
          <h1 className="text-2xl font-bold">SeatFlow</h1>
        </div>
      </div>

      <p className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/75">
        Manage uploads, exams, halls, and printable layouts from one responsive dashboard.
      </p>

      <nav className="mt-10 space-y-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSectionChange(section.id)}
              className={clsx(
                "flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm font-semibold transition",
                isActive ? "bg-white text-ink shadow-soft" : "bg-transparent text-white/76 hover:bg-white/8"
              )}
            >
              <Icon className={clsx("h-5 w-5", isActive ? "text-primary" : "text-accent")} />
              <span>{section.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}


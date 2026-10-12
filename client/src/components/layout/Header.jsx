import clsx from "clsx";
import { CalendarDays, LogOut } from "lucide-react";
import Button from "../ui/Button.jsx";

export default function Header({ sections, activeSection, onSectionChange, user, onLogout }) {
  const today = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="print-hidden sticky top-0 z-20 border-b border-white/60 bg-shell/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-primary">Exam Hall Seating</p>
            <h2 className="mt-1 text-3xl font-bold text-ink">Allocation Dashboard</h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-medium text-muted">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                {today}
              </span>
            </div>

            <div className="rounded-full border border-line bg-white/80 px-4 py-2 text-sm text-muted">
              Signed in as <span className="font-semibold text-ink">{user?.name || "Admin"}</span>
            </div>

            <Button variant="ghost" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSectionChange(section.id)}
                className={clsx(
                  "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                  activeSection === section.id
                    ? "bg-primary text-white"
                    : "bg-white/80 text-muted hover:bg-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}


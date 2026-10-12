import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";

export default function AppShell({
  sections,
  activeSection,
  onSectionChange,
  user,
  onLogout,
  children,
}) {
  return (
    <div className="min-h-screen text-ink">
      <Sidebar sections={sections} activeSection={activeSection} onSectionChange={onSectionChange} />
      <div className="lg:pl-72">
        <Header
          sections={sections}
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          user={user}
          onLogout={onLogout}
        />
        <main className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}


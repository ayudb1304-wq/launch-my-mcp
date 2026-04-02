"use client";

import { Sidebar, MobileSidebar } from "./Sidebar";

interface SidebarProject {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export function AppShell({
  email,
  projects,
  children,
}: {
  email: string;
  projects: SidebarProject[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar email={email} projects={projects} />

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center gap-3 border-b border-border px-4 lg:hidden">
          <MobileSidebar email={email} projects={projects} />
          <span className="text-base font-bold text-foreground">
            Launch My MCP
          </span>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

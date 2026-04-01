"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  Plus,
  LogOut,
  Activity,
  Server,
  Menu,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";

interface SidebarProject {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface SidebarProps {
  email: string;
  projects: SidebarProject[];
}

const mainNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Settings", href: "/settings", icon: Settings },
];

function SidebarContent({
  email,
  projects,
  onNavigate,
}: SidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-white/5 px-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-0.5"
          onClick={onNavigate}
        >
          <span className="font-heading text-xl font-bold text-[var(--mcpl-cyan)]">
            M
          </span>
          <span className="font-heading text-lg font-medium text-white">
            CPLaunch
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {/* Main nav */}
        {mainNav.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-[var(--mcpl-cyan)]/10 text-[var(--mcpl-cyan)]"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}

        {/* Projects section */}
        {projects.length > 0 && (
          <div className="pt-4">
            <div className="flex items-center justify-between px-3 pb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                MCP Servers
              </span>
              <Link href="/onboard" onClick={onNavigate}>
                <Plus className="h-3.5 w-3.5 text-gray-500 hover:text-white" />
              </Link>
            </div>
            {projects.map((project) => {
              const isActive = pathname === `/dashboard/${project.id}`;
              return (
                <Link
                  key={project.id}
                  href={`/dashboard/${project.id}`}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-[var(--mcpl-cyan)]/10 text-[var(--mcpl-cyan)]"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      project.status === "live"
                        ? "bg-green-400"
                        : project.status === "paused"
                          ? "bg-yellow-400"
                          : "bg-gray-600"
                    }`}
                  />
                  <span className="truncate">{project.name}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* New server CTA */}
        <div className="pt-2">
          <Link href="/onboard" onClick={onNavigate}>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-dashed border-gray-700 text-gray-400 hover:border-[var(--mcpl-cyan)]/30 hover:text-white"
            >
              <Plus className="h-4 w-4" />
              New MCP Server
            </Button>
          </Link>
        </div>
      </nav>

      {/* User section */}
      <div className="border-t border-white/5 p-3">
        <div className="flex items-center justify-between rounded-lg px-3 py-2">
          <span className="truncate text-xs text-gray-400">{email}</span>
          <button
            onClick={handleSignOut}
            className="shrink-0 text-gray-500 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Desktop sidebar
export function Sidebar(props: SidebarProps) {
  return (
    <aside className="hidden h-screen w-60 shrink-0 border-r border-white/5 bg-[var(--mcpl-navy)] lg:block">
      <SidebarContent {...props} />
    </aside>
  );
}

// Mobile sidebar trigger + sheet
export function MobileSidebar(props: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-gray-400 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-60 border-white/5 bg-[var(--mcpl-navy)] p-0"
      >
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SidebarContent {...props} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

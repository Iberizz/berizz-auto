"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

const NAV = [
  {
    label: "Dashboard",
    href: "/backoffice",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="14"
          y="3"
          width="7"
          height="7"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    label: "Modèles",
    href: "/backoffice/models",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M19 17H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M3 17l4-4 4 4 4-6 4 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Couleurs",
    href: "/backoffice/colors",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M12 3v9l6 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Options",
    href: "/backoffice/packs",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Contacts",
    href: "/backoffice/contacts",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Commandes",
    href: "/backoffice/orders",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/backoffice/login") {
      setChecking(false);
      return;
    }
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.replace("/login");
        return;
      }
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("id", data.session.user.id)
        .single();
      if (roleData?.role !== "admin") {
        router.replace("/account");
        return;
      }
      setChecking(false);
    });
  }, [router, pathname]);

  // Ferme le menu mobile à chaque changement de page
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (checking)
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-[#E31F2C] rounded-full animate-spin" />
      </div>
    );

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/20">
        <Link href="/" className="font-black text-lg tracking-[3px] uppercase">
          BERIZZ<span className="text-[#E31F2C]">.</span>
        </Link>
        <div className="text-[10px] tracking-[3px] uppercase text-white/30 mt-0.5">
          Backoffice
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map((item) => {
          const isActive =
            item.href === "/backoffice"
              ? pathname === "/backoffice"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              <span className={isActive ? "text-[#E31F2C]" : ""}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/20 flex flex-col gap-3">
        <Link
          href="/"
          className="text-[11px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-2"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M5 12l7-7M5 12l7 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Voir le site
        </Link>
        <button
          onClick={handleLogout}
          className="text-[11px] text-[#E31F2C]/50 hover:text-[#E31F2C] transition-colors flex items-center gap-2 w-full"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {pathname !== "/backoffice/login" && (
        <>
          {/* Sidebar desktop */}
          <aside className="hidden md:flex w-[220px] flex-shrink-0 border-r border-white/20 flex-col">
            <SidebarContent />
          </aside>

          {/* Topbar mobile */}
          <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a] border-b border-white/20 flex items-center justify-between px-5 h-[52px]">
            <Link
              href="/"
              className="font-black text-[15px] tracking-[3px] uppercase"
            >
              BERIZZ<span className="text-[#E31F2C]">.</span>
            </Link>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="flex flex-col gap-[5px] w-6 h-6 justify-center"
            >
              <span
                className={`block h-px w-full bg-white transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[6px]" : ""}`}
              />
              <span
                className={`block h-px w-full bg-white transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-px w-full bg-white transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[6px]" : ""}`}
              />
            </button>
          </div>

          {/* Mobile menu overlay */}
          {mobileOpen && (
            <div
              className="md:hidden fixed inset-0 z-40 bg-black/60"
              onClick={() => setMobileOpen(false)}
            />
          )}

          {/* Mobile drawer */}
          <aside
            className={`md:hidden fixed top-[52px] left-0 bottom-0 z-50 w-[260px] bg-[#0a0a0a] border-r border-white/20 flex flex-col transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main */}
      <main
        className={`flex-1 overflow-auto ${pathname !== "/backoffice/login" ? "md:ml-0 pt-[52px] md:pt-0" : ""}`}
      >
        {children}
      </main>
    </div>
  );
}

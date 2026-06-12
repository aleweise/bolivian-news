"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Settings,
  Newspaper,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/articles", label: "Artículos", icon: FileText },
  { href: "/admin/articles?reviewed=false", label: "Por Revisar", icon: CheckSquare },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 border-r border-[var(--border)] bg-[var(--background)] hidden md:block">
      <div className="flex h-14 items-center border-b border-[var(--border)] px-4">
        <Newspaper className="h-5 w-5 text-[var(--bolivia-red)] mr-2" />
        <span className="font-bold text-sm">
          Bolivia<span className="text-[var(--bolivia-gold)]">News</span>
        </span>
        <span className="ml-2 text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-0.5 rounded">
          Admin
        </span>
      </div>

      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href.split("?")[0])
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                isActive
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-4 left-0 w-64 p-3 border-t border-[var(--border)]">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          Ver sitio público
        </Link>
      </div>
    </aside>
  )
}

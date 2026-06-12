"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Newspaper, Menu, X, Search } from "lucide-react"
import { useState } from "react"

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/category/mundo", label: "Mundo" },
  { href: "/category/economia", label: "Economía" },
  { href: "/category/politica", label: "Política" },
  { href: "/category/cultura", label: "Cultura" },
  { href: "/category/deportes", label: "Deportes" },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/80">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <Newspaper className="h-6 w-6 text-[var(--bolivia-red)]" />
          <span className="font-bold text-lg tracking-tight">
            Bolivia<span className="text-[var(--bolivia-gold)]">News</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                pathname === link.href
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <Link
            href="/search"
            className="p-2 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href="/admin"
            className="hidden md:inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-[var(--secondary)] hover:bg-[var(--accent)] text-[var(--secondary-foreground)] transition-colors"
          >
            Admin
          </Link>
          <button
            className="md:hidden p-2 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--background)]">
          <nav className="container px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 text-sm rounded-md ${
                  pathname === link.href
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-sm rounded-md bg-[var(--secondary)] text-[var(--secondary-foreground)] mt-2"
            >
              Admin
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

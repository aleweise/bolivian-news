import Link from "next/link"
import { Newspaper } from "lucide-react"

const footerLinks = [
  { href: "/category/mundo", label: "Mundo" },
  { href: "/category/economia", label: "Economía" },
  { href: "/category/politica", label: "Política" },
  { href: "/category/cultura", label: "Cultura" },
  { href: "/category/deportes", label: "Deportes" },
]

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-[var(--bolivia-red)]" />
            <span className="font-bold text-sm">
              Bolivia<span className="text-[var(--bolivia-gold)]">News</span>
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-4">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <p className="text-xs text-[var(--muted-foreground)]">
            © {new Date().getFullYear()} BoliviaNews. Santa Cruz, Bolivia.
          </p>
        </div>
      </div>
    </footer>
  )
}

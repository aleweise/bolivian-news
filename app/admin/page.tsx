import { createClient } from "@/lib/supabase/server"
import { StatsCards } from "@/components/StatsCards"
import { ArticleCard } from "@/components/ArticleCard"
import { FileText, CheckSquare, Globe, Clock } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Stats queries
  const [totalResult, unreviewedResult, byCategoryResult, recentResult] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact", head: true }),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("is_reviewed", false),
    supabase.from("articles").select("category").then(r => {
      const counts: Record<string, number> = {}
      r.data?.forEach((a: { category: string }) => {
        counts[a.category] = (counts[a.category] || 0) + 1
      })
      return counts
    }),
    supabase
      .from("articles")
      .select("*")
      .eq("is_reviewed", false)
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  const total = totalResult.count || 0
  const unreviewed = unreviewedResult.count || 0
  const recent = recentResult.data || []

  const stats = [
    {
      title: "Total Artículos",
      value: total,
      icon: <FileText className="h-4 w-4 text-[var(--muted-foreground)]" />,
      description: `En la base de datos`,
    },
    {
      title: "Por Revisar",
      value: unreviewed,
      icon: <CheckSquare className="h-4 w-4 text-[var(--bolivia-gold)]" />,
      description: unreviewed > 0 ? "Requieren atención" : "Todo revisado ✓",
    },
    {
      title: "Fuentes",
      value: Object.keys(byCategoryResult).length || "—",
      icon: <Globe className="h-4 w-4 text-[var(--muted-foreground)]" />,
      description: "Categorías activas",
    },
    {
      title: "Uptime",
      value: "24/7",
      icon: <Clock className="h-4 w-4 text-[var(--bolivia-green)]" />,
      description: "Publicación automática",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Resumen de tu portal de noticias
        </p>
      </div>

      <StatsCards stats={stats} />

      {/* Quick actions */}
      <div className="flex gap-3 flex-wrap">
        <Link
          href="/admin/articles"
          className="inline-flex items-center justify-center rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 transition-colors"
        >
          Ver Todos los Artículos
        </Link>
        <Link
          href="/admin/articles?reviewed=false"
          className="inline-flex items-center justify-center rounded-md border border-[var(--border)] bg-transparent px-4 py-2 text-sm font-medium hover:bg-[var(--accent)] transition-colors"
        >
          Artículos sin Revisar ({unreviewed})
        </Link>
      </div>

      {/* Unreviewed articles preview */}
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Por Revisar</h2>
            <Link
              href="/admin/articles?reviewed=false"
              className="text-sm text-[var(--bolivia-gold)] hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {recent.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}

      {recent.length === 0 && total === 0 && (
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Sin artículos todavía</p>
          <p className="text-sm">
            El scraper de Hermes se encargará de llenar esto automáticamente.
          </p>
        </div>
      )}
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { ArticleCard } from "@/components/ArticleCard"
import { Newspaper } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredArticles } = await supabase
    .from("articles")
    .select("*")
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(1)

  const { data: recentArticles } = await supabase
    .from("articles")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(12)

  const featured = featuredArticles?.[0]
  const articles = recentArticles || []

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero section */}
      {!featured && articles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Newspaper className="h-16 w-16 text-[var(--muted-foreground)] mb-4" />
          <h1 className="text-2xl font-bold mb-2">Bienvenido a BoliviaNews</h1>
          <p className="text-[var(--muted-foreground)] mb-6 max-w-md">
            Tu portal de noticias con IA. Las noticias se scrapearán y publicarán automáticamente.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-md bg-[var(--primary)] px-6 py-3 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 transition-colors"
          >
            Ir al Admin
          </Link>
        </div>
      )}

      {/* Featured article */}
      {featured && (
        <section className="mb-8">
          <ArticleCard article={featured} featured />
        </section>
      )}

      {/* Latest news grid */}
      {articles.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Últimas Noticias</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.slice(featured ? 1 : 0).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

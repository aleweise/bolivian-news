import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Clock, ExternalLink, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ArticleCard } from "@/components/ArticleCard"

export const dynamic = "force-dynamic"

const categoryColors: Record<string, string> = {
  mundo: "bg-[var(--bolivia-red)]",
  economia: "bg-[var(--bolivia-gold)]",
  politica: "bg-[var(--bolivia-blue)]",
  cultura: "bg-[var(--bolivia-purple)]",
  deportes: "bg-[var(--bolivia-green)]",
  tecnologia: "bg-[var(--bolivia-cyan)]",
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleDateString("es-BO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single()

  if (error || !article) {
    notFound()
  }

  const { data: related } = await supabase
    .from("articles")
    .select("*")
    .eq("is_published", true)
    .eq("category", article.category)
    .neq("id", id)
    .order("published_at", { ascending: false })
    .limit(3)

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>

      <article className="space-y-6">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className={categoryColors[article.category] || "bg-[var(--muted)]"}>
              {article.category}
            </Badge>
            <span className="text-xs text-[var(--muted-foreground)]">{article.source}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            {article.title}
          </h1>

          {article.summary && (
            <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
              {article.summary}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
            {article.author && (
              <>
                <span>Por {article.author}</span>
                <span>•</span>
              </>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDate(article.published_at)}
            </span>
          </div>
        </header>

        {/* Image */}
        {article.image_url && (
          <div className="rounded-lg overflow-hidden bg-[var(--muted)]">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Content */}
        {article.content && (
          <div
            className="prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        )}

        {/* Source link */}
        {article.source_url && (
          <div className="pt-6 border-t border-[var(--border)]">
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[var(--bolivia-gold)] hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Leer artículo original en {article.source}
            </a>
          </div>
        )}
      </article>

      {/* Related */}
      {related && related.length > 0 && (
        <section className="mt-12 pt-8 border-t border-[var(--border)]">
          <h2 className="text-lg font-semibold mb-4">Noticias Relacionadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((rel) => (
              <ArticleCard key={rel.id} article={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

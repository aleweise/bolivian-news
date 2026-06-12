import Link from "next/link"
import Image from "next/image"
import { ExternalLink, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Article } from "@/lib/types"

interface ArticleCardProps {
  article: Article
  featured?: boolean
}

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
  const date = new Date(dateStr)
  return date.toLocaleDateString("es-BO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const bgColor = categoryColors[article.category] || "bg-[var(--muted)]"

  if (featured) {
    return (
      <Link
        href={`/article/${article.id}`}
        className="group relative overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] block"
      >
        <div className="aspect-[2/1] relative bg-[var(--muted)]">
          {article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-[var(--bolivia-red)]/20 to-[var(--bolivia-gold)]/20">
              <span className="text-4xl font-bold text-[var(--muted-foreground)]">
                {article.title.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge className={bgColor} variant="default">
              {article.category}
            </Badge>
          </div>
        </div>
        <div className="p-4">
          <h2 className="font-bold text-xl mb-2 line-clamp-2 group-hover:text-[var(--bolivia-gold)] transition-colors">
            {article.title}
          </h2>
          {article.summary && (
            <p className="text-sm text-[var(--muted-foreground)] mb-3 line-clamp-2">
              {article.summary}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
            <span className="font-medium text-[var(--bolivia-gold)]">{article.source}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(article.published_at)}
            </span>
            {article.source_url && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  Fuente
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/article/${article.id}`}
      className="group flex gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:border-[var(--bolivia-gold)]/50 transition-colors"
    >
      <div className="w-24 h-24 shrink-0 rounded-md overflow-hidden bg-[var(--muted)]">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-[var(--bolivia-red)]/10 to-[var(--bolivia-gold)]/10">
            <span className="text-xl font-bold text-[var(--muted-foreground)]">
              {article.title.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge className={`text-xs ${bgColor}`} variant="default">
            {article.category}
          </Badge>
          <span className="text-xs text-[var(--muted-foreground)]">{article.source}</span>
        </div>
        <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-[var(--bolivia-gold)] transition-colors">
          {article.title}
        </h3>
        <div className="mt-2 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(article.published_at)}
          </span>
        </div>
      </div>
    </Link>
  )
}

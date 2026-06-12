"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, CheckSquare, Search, ExternalLink, Trash2, Eye, EyeOff, Loader2 } from "lucide-react"
import type { Article } from "@/lib/types"

const categories = ["todos", "mundo", "economia", "politica", "cultura", "deportes", "tecnologia"]

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("es-BO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function AdminArticlesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const perPage = 20

  const filterReviewed = searchParams.get("reviewed") || "todos"
  const filterCategory = searchParams.get("category") || "todos"
  const searchQuery = searchParams.get("q") || ""

  useEffect(() => {
    fetchArticles()
  }, [page, filterReviewed, filterCategory, searchQuery])

  async function fetchArticles() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(perPage),
        ...(filterReviewed !== "todos" && { reviewed: filterReviewed }),
        ...(filterCategory !== "todos" && { category: filterCategory }),
        ...(searchQuery && { q: searchQuery }),
      })
      const res = await fetch(`/api/articles?${params}`)
      const data = await res.json()
      setArticles(data.articles || [])
      setTotal(data.total || 0)
    } finally {
      setLoading(false)
    }
  }

  async function togglePublish(id: string, current: boolean) {
    await fetch(`/api/articles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !current }),
    })
    fetchArticles()
  }

  async function deleteArticle(id: string) {
    if (!confirm("¿Eliminar este artículo?")) return
    await fetch(`/api/articles/${id}`, { method: "DELETE" })
    fetchArticles()
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Artículos</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {total} artículos en total
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <Input
                placeholder="Buscar artículos..."
                value={searchQuery}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams.toString())
                  if (e.target.value) params.set("q", e.target.value)
                  else params.delete("q")
                  router.push(`/admin/articles?${params}`)
                }}
                className="pl-9"
              />
            </div>

            {/* Category filter */}
            <div className="flex gap-1 flex-wrap">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={filterCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    if (cat === "todos") params.delete("category")
                    else params.set("category", cat)
                    router.push(`/admin/articles?${params}`)
                  }}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Status filter */}
          <div className="flex gap-2">
            <Button
              variant={filterReviewed === "todos" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString())
                params.delete("reviewed")
                router.push(`/admin/articles?${params}`)
              }}
            >
              Todos
            </Button>
            <Button
              variant={filterReviewed === "false" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString())
                params.set("reviewed", "false")
                router.push(`/admin/articles?${params}`)
              }}
            >
              <CheckSquare className="h-3 w-3 mr-1" />
              Por revisar
            </Button>
            <Button
              variant={filterReviewed === "true" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString())
                params.set("reviewed", "true")
                router.push(`/admin/articles?${params}`)
              }}
            >
              <FileText className="h-3 w-3 mr-1" />
              Revisados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Articles table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No hay artículos</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {articles.map((article) => (
              <Card key={article.id} className="hover:border-[var(--bolivia-gold)]/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-[var(--muted)] shrink-0">
                      {article.image_url ? (
                        <img
                          src={article.image_url}
                          alt=""
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-xl font-bold text-[var(--muted-foreground)]">
                          {article.title.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                        {!article.is_reviewed && (
                          <Badge variant="warning" className="text-xs">
                            Sin revisar
                          </Badge>
                        )}
                        {!article.is_published && (
                          <Badge variant="secondary" className="text-xs">
                            Oculto
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-medium text-sm line-clamp-1">{article.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[var(--muted-foreground)]">
                        <span>{article.source}</span>
                        <span>•</span>
                        <span>{formatDate(article.published_at)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={`/article/${article.id}`} target="_blank">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/articles/${article.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => togglePublish(article.id, article.is_published)}
                      >
                        {article.is_published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[var(--destructive)]"
                        onClick={() => deleteArticle(article.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </Button>
              <span className="text-sm text-[var(--muted-foreground)]">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function AdminArticlesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
        </div>
      }
    >
      <AdminArticlesContent />
    </Suspense>
  )
}

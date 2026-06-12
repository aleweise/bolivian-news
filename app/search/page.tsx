"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { ArticleCard } from "@/components/ArticleCard"
import { Search as SearchIcon, Loader2 } from "lucide-react"
import type { Article } from "@/lib/types"

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query) {
      searchArticles(query)
    }
  }, [query])

  async function searchArticles(q: string) {
    setLoading(true)
    try {
      const params = new URLSearchParams({ q, limit: "20" })
      const res = await fetch(`/api/articles?${params}`)
      const data = await res.json()
      setResults(data.articles || [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
          <Loader2 className="h-5 w-5 animate-spin" />
          Buscando...
        </div>
      ) : query && results.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">
          No se encontraron resultados para "{query}"
        </p>
      ) : results.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            {results.length} resultados para "{query}"
          </p>
          {results.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <p className="text-[var(--muted-foreground)]">Ingresá un término de búsqueda</p>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Buscar</h1>

      <div className="relative max-w-xl mb-8">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
        <Input
          placeholder="Buscar noticias..."
          className="pl-9"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const q = e.currentTarget.value
              window.location.href = `/search?q=${encodeURIComponent(q)}`
            }
          }}
        />
      </div>

      <Suspense fallback={<p className="text-[var(--muted-foreground)]">Cargando...</p>}>
        <SearchContent />
      </Suspense>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, ExternalLink, Loader2 } from "lucide-react"
import Link from "next/link"
import type { Article } from "@/lib/types"

const categories = ["mundo", "economia", "politica", "cultura", "deportes", "tecnologia"]
const regions = ["mundial", "nacional", "santa_cruz", "la_paz", "cochabamba", "sucre"]

export default function AdminArticleEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: "",
    content: "",
    summary: "",
    source: "",
    source_url: "",
    image_url: "",
    category: "mundo",
    region: "mundial",
    tags: "",
    is_reviewed: false,
    is_published: true,
    is_featured: false,
  })

  useEffect(() => {
    if (id === "new") {
      setLoading(false)
      return
    }
    fetchArticle()
  }, [id])

  async function fetchArticle() {
    try {
      const res = await fetch(`/api/articles/${id}`)
      if (!res.ok) throw new Error("Not found")
      const data = await res.json()
      setArticle(data)
      setForm({
        title: data.title || "",
        content: data.content || "",
        summary: data.summary || "",
        source: data.source || "",
        source_url: data.source_url || "",
        image_url: data.image_url || "",
        category: data.category || "mundo",
        region: data.region || "mundial",
        tags: (data.tags || []).join(", "),
        is_reviewed: data.is_reviewed || false,
        is_published: data.is_published ?? true,
        is_featured: data.is_featured || false,
      })
    } catch {
      alert("Artículo no encontrado")
      router.push("/admin/articles")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      }
      const res = await fetch(`/api/articles/${id}`, {
        method: id === "new" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Save failed")
      router.push("/admin/articles")
    } catch (e) {
      alert("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/articles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            {id === "new" ? "Nuevo Artículo" : "Editar Artículo"}
          </h1>
          {article && (
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={article.is_reviewed ? "success" : "warning"}>
                {article.is_reviewed ? "Revisado" : "Sin revisar"}
              </Badge>
              <Link href={`/article/${id}`} target="_blank" className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                <ExternalLink className="h-3 w-3 inline mr-1" />
                Ver público
              </Link>
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-1 block">Título</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Título de la noticia"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="text-sm font-medium mb-1 block">Resumen</label>
            <Textarea
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="Resumen corto..."
              rows={2}
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium mb-1 block">Contenido (HTML)</label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Contenido HTML..."
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          {/* Source & URL */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Fuente</label>
              <Input
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="Reuters, BBC, etc."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">URL Fuente</label>
              <Input
                value={form.source_url}
                onChange={(e) => setForm({ ...form, source_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="text-sm font-medium mb-1 block">URL Imagen</label>
            <Input
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          {/* Category & Region */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Categoría</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="flex h-9 w-full rounded-md border border-[var(--input)] bg-transparent px-3 py-1 text-sm"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Región</label>
              <select
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="flex h-9 w-full rounded-md border border-[var(--input)] bg-transparent px-3 py-1 text-sm"
              >
                {regions.map((r) => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium mb-1 block">Tags (separados por coma)</label>
            <Input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_reviewed}
                onChange={(e) => setForm({ ...form, is_reviewed: e.target.checked })}
                className="rounded"
              />
              Revisado
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="rounded"
              />
              Publicado
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="rounded"
              />
              Destacado
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Guardando..." : "Guardar"}
        </Button>
        <Link href="/admin/articles">
          <Button variant="outline">Cancelar</Button>
        </Link>
      </div>
    </div>
  )
}

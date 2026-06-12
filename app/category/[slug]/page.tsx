import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ArticleCard } from "@/components/ArticleCard"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

const categoryNames: Record<string, string> = {
  mundo: "Mundo",
  economia: "Economía",
  politica: "Política",
  cultura: "Cultura",
  deportes: "Deportes",
  tecnologia: "Tecnología",
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const categoryName = categoryNames[slug] || slug

  if (!categoryNames[slug]) {
    notFound()
  }

  const supabase = await createClient()

  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .eq("is_published", true)
    .eq("category", slug)
    .order("published_at", { ascending: false })
    .limit(50)

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-8">
        <Badge variant="outline" className="mb-2">
          {categoryName}
        </Badge>
        <h1 className="text-3xl font-bold">Noticias de {categoryName}</h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          {articles?.length || 0} artículos
        </p>
      </header>

      {articles && articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-[var(--muted-foreground)]">
          <p>No hay artículos en esta categoría todavía.</p>
        </div>
      )}
    </div>
  )
}

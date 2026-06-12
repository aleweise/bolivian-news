#!/usr/bin/env pnpm tsx
/**
 * Bolivia News Scraper - Firecrawl Edition
 * 
 * Uses Firecrawl API for reliable scraping
 * Falls back to keyword analysis when AI is unavailable
 */

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY!
const GLM_API_KEY = process.env.GLM_API_KEY || ""
const SCRAPE_WEBHOOK_SECRET = process.env.SCRAPE_WEBHOOK_SECRET || "scrape-secret"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

const sources = [
  { name: "El Deber", url: "https://eldeber.com.bo/" },
  { name: "Ejú!", url: "https://eju.tv/" },
  { name: "Red Uno", url: "https://www.reduno.com.bo/" },
  { name: "Unitel", url: "https://www.unitel.bo/" },
  { name: "Reuters", url: "https://www.reuters.com/world/americas/" },
  { name: "BBC Mundo", url: "https://www.bbc.com/mundo" },
  { name: "AP News", url: "https://apnews.com/hub/latin-america" },
  { name: "Al Jazeera", url: "https://www.aljazeera.com/americas" },
]

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function scrapeWithFirecrawl(url: string): Promise<{content: string, links: string[]}> {
  const res = await fetch("https://api.firecrawl.dev/v0/scrape", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + FIRECRAWL_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url,
      pageOptions: { onlyMainContent: true }
    })
  })
  
  if (!res.ok) {
    const text = await res.text()
    throw new Error("Firecrawl " + res.status + ": " + text)
  }
  
  const data = await res.json()
  return {
    content: data.data?.content || "",
    links: data.data?.linksOnPage || []
  }
}

function extractArticles(content: string, sourceUrl: string): {title: string, link: string, image: string}[] {
  const articles: {title: string, link: string, image: string}[] = []
  
  // Extract markdown links: [Title](url)
  const linkRegex = /\[([^\]]{10,})\]\((https?:\/\/[^\)]+)\)/g
  let match
  while ((match = linkRegex.exec(content)) !== null) {
    const title = match[1].trim()
    const link = match[2].trim()
    
    if (title.length > 10 && link.startsWith("http") && 
        !link.includes("facebook") && !link.includes("twitter") && 
        !link.includes("instagram") && !link.includes("youtube")) {
      articles.push({ title, link, image: "" })
    }
  }
  
  // Extract images: ![alt](url)
  const imgRegex = /!\[([^\]]*)\]\((https?:\/\/[^)]+\.(jpg|jpeg|png|webp)[^)]*)\)/g
  const images: Record<string, string> = {}
  while ((match = imgRegex.exec(content)) !== null) {
    const url = match[2]
    if (url.includes("pxcdn") || url.includes("cdn.")) {
      images[Object.keys(images).length] = url
    }
  }
  
  // Attach images to articles by proximity (rough heuristic)
  for (let i = 0; i < Math.min(articles.length, Object.keys(images).length); i++) {
    articles[i].image = images[i] || ""
  }
  
  return articles.slice(0, 10)
}

async function analyzeWithAI(title: string, link: string, image: string) {
  const prompt = `Eres un editor de noticias boliviano. Clasifica esta noticia.

Título: "${title}"
Fuente: ${link}
${image ? "Imagen: " + image : ""}

Responde SOLO con JSON válido:
{"title": "...", "summary": "...", "category": "mundo|economia|politica|cultura|deportes|tecnologia", "region": "bolivia|mundial|santa_cruz|la_paz|cochabamba", "tags": ["tag1", "tag2"]}`

  // Try GLM first
  if (GLM_API_KEY) {
    try {
      const res = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + GLM_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "glm-4-flash",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 300,
          temperature: 0.3
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        const text = data.choices?.[0]?.message?.content || "{}"
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        const jsonStr = jsonMatch ? jsonMatch[0] : "{}"
        const parsed = JSON.parse(jsonStr)
        return {
          title: (parsed.title || title).slice(0, 120),
          summary: (parsed.summary || "").slice(0, 200),
          category: parsed.category || "mundo",
          region: parsed.region || "mundial",
          tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : []
        }
      } else {
        console.error("  ⚠ GLM " + res.status)
      }
    } catch (e) {
      console.error("  ⚠ GLM error: " + e)
    }
  }

  // Fallback: keyword analysis
  const lower = title.toLowerCase()
  let category = "mundo"
  let region = "mundial"
  
  if (/econom|dólar|bolivia\.bo/.test(lower)) category = "economia"
  else if (/polític|gobierno|congreso|evo|marcha|bloqueo/.test(lower)) category = "politica"
  else if (/deport|fútbol|mundial|liga|bloomings/.test(lower)) category = "deportes"
  else if (/músic|cultur|arte/.test(lower)) category = "cultura"
  else if (/tecno|ia|ai|apple|google/.test(lower)) category = "tecnologia"
  
  if (/santa cruz|cruceñ/.test(lower)) region = "santa_cruz"
  else if (/la paz|paceñ/.test(lower)) region = "la_paz"
  else if (/cochabamba|cochabambin/.test(lower)) region = "cochabamba"
  
  return { title, summary: "", category, region, tags: [] }
}

async function main() {
  console.log("🚀 Bolivia News Scraper (Firecrawl)")
  console.log("   " + new Date().toISOString() + "\n")

  const allArticles: any[] = []

  for (const source of sources) {
    console.log("🌐 " + source.name + "...")
    
    try {
      const { content, links } = await scrapeWithFirecrawl(source.url)
      const articles = extractArticles(content, source.url)
      
      console.log("  Found " + articles.length + " articles")
      
      for (const article of articles) {
        if (!article.title || article.title.length < 15) continue
        
        console.log("  📰 " + article.title.slice(0, 60) + "...")
        
        const analysis = await analyzeWithAI(article.title, article.link, article.image)
        
        allArticles.push({
          title: analysis.title,
          summary: analysis.summary,
          content: null,
          source: source.name,
          source_url: article.link,
          image_url: article.image || null,
          category: analysis.category,
          region: analysis.region,
          tags: analysis.tags,
          author: null,
          published_at: new Date().toISOString(),
          is_reviewed: false,
          is_published: true,
          is_featured: false
        })
        
        await delay(1500)
      }
    } catch (e) {
      console.error("  ❌ " + source.name + ": " + e)
    }
    
    await delay(2000)
  }

  if (allArticles.length === 0) {
    console.log("\n⚠ No articles scraped")
    return
  }

  console.log("\n💾 Saving " + allArticles.length + " articles to Supabase...")

  const { data, error } = await supabase
    .from("articles")
    .insert(allArticles)
    .select("id")

  if (error) {
    console.error("\n❌ Supabase: " + error.message)
    return
  }

  await supabase.from("scrape_logs").insert({
    source: "firecrawl-multi",
    articles_count: allArticles.length,
    status: "success"
  })

  console.log("\n✅ " + (data?.length || 0) + " articles saved!")
}

main().catch(console.error)

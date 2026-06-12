#!/usr/bin/env pnpm tsx
/**
 * Bolivia News Scraper
 * 
 * Runs on your PC via Hermes cron (every 8 hours)
 * Scrapes news from multiple sources, analyzes with AI (MiniMax),
 * and saves directly to Supabase.
 * 
 * Usage: pnpm scrape
 */

import { createClient } from "@supabase/supabase-js"

// ─── Config ─────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY!
const SCRAPE_WEBHOOK_SECRET = process.env.SCRAPE_WEBHOOK_SECRET || "scrape-secret"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

// ─── News Sources ─────────────────────────────────────────────────────────────

interface NewsSource {
  name: string
  url: string
  selectors: {
    articles: string
    title: string
    link: string
    image?: string
    date?: string
  }
}

const sources: NewsSource[] = [
  {
    name: "Reuters",
    url: "https://www.reuters.com/world/americas/",
    selectors: {
      articles: "article",
      title: "h2, h3",
      link: "a[href]",
      image: "img[src]",
      date: "time"
    }
  },
  {
    name: "BBC Mundo",
    url: "https://www.bbc.com/mundo",
    selectors: {
      articles: "article",
      title: "h2, h3",
      link: "a[href]",
      image: "img[src]",
      date: "time"
    }
  },
  {
    name: "AP News",
    url: "https://apnews.com/hub/latin-america",
    selectors: {
      articles: "article",
      title: "h2, h3",
      link: "a[href]",
      image: "img[src]",
      date: "time"
    }
  },
  {
    name: "Al Jazeera",
    url: "https://www.aljazeera.com/americas",
    selectors: {
      articles: "article",
      title: "h2, h3",
      link: "a[href]",
      image: "img[src]",
      date: "time"
    }
  }
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchHTML(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

function extractText(html: string, selector: string): string[] {
  // Very simple regex extraction (no DOM parser needed for simple cases)
  const results: string[] = []
  
  if (selector.includes("h2") || selector.includes("h3")) {
    const matches = html.match(/<h[23][^>]*>([^<]+)<\/h[23]>/gi) || []
    results.push(...matches.map(m => m.replace(/<[^>]+>/g, "").trim()).filter(Boolean))
  }
  
  return results
}

function extractLinks(html: string, sourceUrl: string): string[] {
  const base = new URL(sourceUrl).origin
  const hrefs: string[] = []
  const matches = html.match(/href=["']([^"']+)["']/gi) || []
  for (const match of matches) {
    const href = match.replace(/href=["']/g, "").replace(/["']/g, "")
    if (href.startsWith("http") && !href.includes("javascript")) {
      hrefs.push(href)
    } else if (href.startsWith("/")) {
      hrefs.push(base + href)
    }
  }
  return [...new Set(hrefs)].slice(0, 20) // dedupe, limit 20
}

function extractImages(html: string): string[] {
  const srcs: string[] = []
  const matches = html.match(/src=["']([^"']+\.(jpg|jpeg|png|webp)[^"']*)["']/gi) || []
  for (const match of matches) {
    const src = match.replace(/src=["']/g, "").replace(/["']/g, "")
    if (src.startsWith("http")) {
      srcs.push(src)
    }
  }
  return [...new Set(srcs)]
}

// ─── AI Analysis ─────────────────────────────────────────────────────────────

interface ArticleAnalysis {
  title: string
  summary: string
  category: string
  region: string
  tags: string[]
}

async function analyzeWithAI(
  title: string,
  sourceUrl: string,
  imageUrl?: string
): Promise<ArticleAnalysis> {
  const prompt = `Eres un editor de noticias experto. Analiza esta noticia y clasifícala.

Título: "${title}"
Fuente: ${sourceUrl}
${imageUrl ? `Imagen: ${imageUrl}` : ""}

Responde SOLO con JSON válido (sin markdown, sin código, solo el objeto):
{
  "title": "título en español (máx 120 chars)",
  "summary": "resumen de 1-2 oraciones (máx 200 chars)",
  "category": "mundo|economia|politica|cultura|deportes|tecnologia",
  "region": "mundial|nacional|santa_cruz|la_paz|cochabamba",
  "tags": ["tag1", "tag2", "tag3"]
}

Clasifica por contenido real del título.`

  try {
    const res = await fetch("https://api.minimax.io/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MINIMAX_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "MiniMax-M2.7",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.3
      })
    })

    if (!res.ok) {
      console.error(`  ⚠ AI API error: ${res.status}`)
      return defaultAnalysis(title)
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || "{}"
    
    // Try to extract JSON from response
    let jsonStr = text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) jsonStr = jsonMatch[0]
    
    const parsed = JSON.parse(jsonStr)
    return {
      title: (parsed.title || title).slice(0, 120),
      summary: (parsed.summary || "").slice(0, 200),
      category: parsed.category || "mundo",
      region: parsed.region || "mundial",
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : []
    }
  } catch (e) {
    console.error(`  ⚠ AI analysis failed: ${e}`)
    return defaultAnalysis(title)
  }
}

function defaultAnalysis(title: string): ArticleAnalysis {
  // Fallback: guess from keywords
  const lower = title.toLowerCase()
  let category = "mundo"
  let region = "mundial"
  
  if (lower.includes("econom") || lower.includes("dólar") || lower.includes("bolivia")) {
    category = "economia"
  } else if (lower.includes("polític") || lower.includes("gobierno") || lower.includes("congreso")) {
    category = "politica"
  } else if (lower.includes("deport") || lower.includes("fútbol") || lower.includes("liga")) {
    category = "deportes"
  } else if (lower.includes("músic") || lower.includes("cultur") || lower.includes("arte")) {
    category = "cultura"
  } else if (lower.includes("tecno") || lower.includes("ia") || lower.includes("ai")) {
    category = "tecnologia"
  }
  
  if (lower.includes("santa cruz") || lower.includes("cruceñ")) region = "santa_cruz"
  else if (lower.includes("la paz")) region = "la_paz"
  else if (lower.includes("cochabamba")) region = "cochabamba"
  
  return {
    title,
    summary: "",
    category,
    region,
    tags: []
  }
}

// ─── Main Scraper ────────────────────────────────────────────────────────────

async function scrapeSource(source: NewsSource): Promise<any[]> {
  console.log(`\n🌐 Scraping ${source.name}...`)
  const articles: any[] = []

  try {
    const html = await fetchHTML(source.url)
    const titles = extractText(html, source.selectors.title)
    const links = extractLinks(html, source.url)
    const images = extractImages(html)

    console.log(`  Found ${titles.length} potential articles`)

    for (let i = 0; i < Math.min(titles.length, 5); i++) {
      const title = titles[i]?.trim()
      if (!title || title.length < 10) continue

      const link = links[i] || ""
      const image = images[i] || ""

      console.log(`  📰 "${title.slice(0, 60)}..."`)
      
      // AI analysis
      const analysis = await analyzeWithAI(title, link, image)

      articles.push({
        title: analysis.title,
        summary: analysis.summary,
        content: null,
        source: source.name,
        source_url: link,
        image_url: image || null,
        category: analysis.category,
        region: analysis.region,
        tags: analysis.tags,
        author: null,
        published_at: new Date().toISOString(),
        is_reviewed: false,
        is_published: true,
        is_featured: false
      })

      // Rate limit AI calls
      await delay(1500)
    }
  } catch (e) {
    console.error(`  ❌ Error scraping ${source.name}: ${e}`)
  }

  return articles
}

async function main() {
  console.log("🚀 Bolivia News Scraper started")
  console.log(`   Time: ${new Date().toISOString()}`)

  const allArticles: any[] = []

  for (const source of sources) {
    const articles = await scrapeSource(source)
    allArticles.push(...articles)
    await delay(2000) // delay between sources
  }

  if (allArticles.length === 0) {
    console.log("\n⚠ No articles scraped")
    return
  }

  console.log(`\n💾 Saving ${allArticles.length} articles to Supabase...`)

  // Save to Supabase
  const { data, error } = await supabase
    .from("articles")
    .insert(allArticles)
    .select("id")

  if (error) {
    console.error(`\n❌ Supabase error: ${error.message}`)
    return
  }

  // Log scrape
  await supabase.from("scrape_logs").insert({
    source: "multiple",
    articles_count: allArticles.length,
    status: "success"
  })

  console.log(`\n✅ Successfully scraped and saved ${data?.length || 0} articles`)
}

// ─── Run ──────────────────────────────────────────────────────────────────────

main().catch(console.error)

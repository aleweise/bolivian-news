import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get("authorization")
    const expectedSecret = process.env.SCRAPE_WEBHOOK_SECRET || "scrape-secret"

    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { articles } = body

    if (!Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json({ error: "No articles provided" }, { status: 400 })
    }

    const supabase = await createClient()

    // Insert articles
    const { data, error } = await supabase
      .from("articles")
      .insert(articles)
      .select("id")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log scrape
    await supabase.from("scrape_logs").insert({
      source: articles[0]?.source || "unknown",
      articles_count: articles.length,
      status: "success",
    })

    return NextResponse.json({
      success: true,
      inserted: data?.length || 0,
    })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

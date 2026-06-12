import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const offset = (page - 1) * limit
  const reviewed = searchParams.get("reviewed")
  const category = searchParams.get("category")
  const q = searchParams.get("q")

  const supabase = await createClient()

  let query = supabase
    .from("articles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (reviewed === "true") query = query.eq("is_reviewed", true)
  else if (reviewed === "false") query = query.eq("is_reviewed", false)

  if (category) query = query.eq("category", category)
  if (q) query = query.ilike("title", `%${q}%`)

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    articles: data || [],
    total: count || 0,
    page,
    limit,
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("articles")
    .insert([body])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

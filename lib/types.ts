export interface Article {
  id: string
  title: string
  content: string | null
  summary: string | null
  source: string
  source_url: string | null
  image_url: string | null
  category: string
  region: string
  tags: string[]
  author: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  is_reviewed: boolean
  is_published: boolean
  is_featured: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  color: string
  created_at: string
}

export interface ScrapeLog {
  id: string
  source: string
  articles_count: number
  status: 'success' | 'partial' | 'failed'
  error_message: string | null
  created_at: string
}

export type ArticleInput = Omit<Article, 'id' | 'created_at' | 'updated_at'>
export type ArticleUpdate = Partial<Omit<Article, 'id' | 'created_at'>>

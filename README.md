# 🇧🇴 Bolivia News CMS

CMS IA-first para noticias de Bolivia y el mundo. El scraping corre automáticamente cada 8 horas via Hermes cron — vos solo corregís desde el dashboard.

## Arquitectura

```
┌─────────────────────────────────────────────┐
│  Vercel (Next.js - Free Tier)               │
│                                             │
│  🌐 Public Site  ← bolivia-news.vercel.app  │
│  🔒 Admin Dashboard ← /admin                │
│  ⚙️  API Routes                              │
└────────────────────┬────────────────────────┘
                     │
              ┌──────▼──────┐
              │  Supabase   │
              │  (PostgreSQL)│
              └─────────────┘
                     ▲
                     │
         ┌───────────┴────────────┐
         │  TU PC (Hermes)        │
         │  Cron: scrape + IA     │
         │  → sube directo a DB   │
         └────────────────────────┘
```

## Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, TailwindCSS v4
- **Base de datos:** Supabase (PostgreSQL)
- **Scraping:** Scripts TypeScript en tu PC, MiniMax para análisis IA
- **Deploy:** Vercel (free tier)
- **Auth:** Contraseña simple via cookie (admin)

## Workflow

1. **Hermes** scrapea noticias cada 8 horas (Reuters, BBC, AP, Al Jazeera)
2. **MiniMax** analiza y clasifica: título, resumen, categoría, tags
3. Se **guardan directo en Supabase** y se publican automáticamente
4. **Vos corregís** desde `/admin` — editás título, contenido, categoría, etc.
5. Marcás como "revisado" y publicás

## Primeros Pasos

### 1. Configurar Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com)
2. Ejecutá el schema en SQL Editor:

```bash
# En Supabase Dashboard → SQL Editor → pegar contenido de:
supabase-schema.sql
```

3. Copiá las credenciales (URL, anon key, service role key)

### 2. Configurar Vercel

```bash
cd bolivian-news
vercel login
vercel deploy
```

Configurá las variables de entorno en Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=tu-contraseña-secreta
SCRAPE_WEBHOOK_SECRET=scrape-secret
```

### 3. Configurar tu PC (scraping)

```bash
cd bolivian-news
cp .env.local.example .env.local
# Editar .env.local con tus credenciales
```

### 4. Correr scraping manualmente

```bash
cd bolivian-news
pnpm scrape
```

### 5. Configurar cron (cada 8 horas)

```bash
hermes cron create \
  --name "Bolivia News Scraper" \
  --schedule "0 */8 * * *" \
  --prompt "Run: cd bolivian-news && pnpm scrape" \
  --skills "terminal"
```

## Dashboard Admin

- **URL:** `/admin`
- **Login:** Contraseña configurada en `ADMIN_PASSWORD`
- **Funciones:**
  - Ver todos los artículos (filtrados por categoría, estado)
  - Editar título, contenido, categoría, tags
  - Marcar como revisado/publicado/oculto
  - Eliminar artículos
  - Crear artículos manualmente

## Rutas

| Ruta | Descripción |
|-----|-------------|
| `/` | Homepage — últimas noticias |
| `/article/[id]` | Artículo completo |
| `/category/[slug]` | Noticias por categoría |
| `/search` | Búsqueda |
| `/admin` | Dashboard admin (protegido) |
| `/admin/articles` | Lista de artículos |
| `/admin/articles/[id]` | Editor de artículo |
| `/admin/settings` | Configuración |

## Fuentes de Noticias

- Reuters (reuters.com)
- BBC Mundo (bbc.com/mundo)
- AP News (apnews.com)
- Al Jazeera (aljazeera.com)

## Scripts

```bash
pnpm scrape          # Ejecutar scraping manualmente
pnpm dev             # Desarrollo local
pnpm build           # Build de producción
pnpm lint            # Linting
```

## License

MIT

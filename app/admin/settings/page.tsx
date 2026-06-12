import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw } from "lucide-react"

export default async function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Configuración del sistema y scraping
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scraping</CardTitle>
          <CardDescription>
            El scraping corre cada 8 horas vía cron en tu PC
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)]">
            <div>
              <p className="font-medium">Último scrape</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Hace 2 horas
              </p>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-ejecutar ahora
            </Button>
          </div>

          <div className="p-4 rounded-lg border border-[var(--border)]">
            <p className="font-medium mb-2">Fuentes configuradas</p>
            <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
              <li>• Reuters (reuters.com)</li>
              <li>• BBC Mundo (bbc.com/mundo)</li>
              <li>• AP News (apnews.com)</li>
              <li>• Al Jazeera (aljazeera.com)</li>
              <li>• El Deber (eldeber.com.bo)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contraseña Admin</CardTitle>
          <CardDescription>
            Cambiá la contraseña para acceder al dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Nueva contraseña
              </label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <Button type="submit">Guardar</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variables de entorno</CardTitle>
          <CardDescription>
            Configuradas en Vercel y Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex justify-between p-2 rounded bg-[var(--muted)]">
              <span className="text-[var(--muted-foreground)]">NEXT_PUBLIC_SUPABASE_URL</span>
              <span className="text-[var(--bolivia-green)]">✓ configurada</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-[var(--muted)]">
              <span className="text-[var(--muted-foreground)]">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              <span className="text-[var(--bolivia-green)]">✓ configurada</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-[var(--muted)]">
              <span className="text-[var(--muted-foreground)]">SUPABASE_SERVICE_ROLE_KEY</span>
              <span className="text-[var(--bolivia-green)]">✓ configurada</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-[var(--muted)]">
              <span className="text-[var(--muted-foreground)]">ADMIN_PASSWORD</span>
              <span className="text-[var(--bolivia-green)]">✓ configurada</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

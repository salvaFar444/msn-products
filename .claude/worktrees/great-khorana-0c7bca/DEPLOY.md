# MSN Products — Guía de Despliegue

## Requisitos previos
- Node.js 18+ instalado → [nodejs.org](https://nodejs.org)
- Cuenta en [Supabase](https://supabase.com) (gratis)
- Cuenta en [Vercel](https://vercel.com) (gratis)
- Cuenta en [GitHub](https://github.com) (gratis)

---

## 1. Dominio — Opciones recomendadas

| Opción | Dominio | Notas |
|---|---|---|
| ⭐ Mejor | `msnproducts.com.co` | Profesional, local, memorable |
| Moderno | `msntech.shop` | Corto, internacional |
| Alternativa | `tiendamsn.com.co` | Español claro, mercado colombiano |

### Dónde comprar en Colombia (mejor precio):
1. **[GoDaddy.com.co](https://godaddy.com)** — Dominio `.com.co` desde ~$25.000 COP/año
2. **[Namecheap](https://namecheap.com)** — `.shop` desde ~$12.000 COP/año
3. **[DonWeb Colombia](https://donweb.com)** — Soporte en español, planes locales

---

## 2. Configurar Supabase

1. Crea una cuenta en [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto → anota la URL y las claves
3. Ve a **SQL Editor** y ejecuta el contenido de `supabase/schema.sql`
   - Esto crea las tablas, RLS, políticas y datos iniciales
4. Ve a **Storage** → verifica que el bucket `product-images` fue creado (público)
5. Ve a **Settings → API** → copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ secreto

---

## 3. Instalar dependencias y configurar localmente

```bash
# 1. Instalar Node.js 18+ si no está instalado
# 2. Instalar dependencias
npm install

# 3. Copiar y configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus valores reales

# 4. Crear el usuario administrador
npx tsx scripts/seed-admin.ts

# 5. Ejecutar en desarrollo
npm run dev
# Abre http://localhost:3000
```

---

## 4. Desplegar en Vercel (gratis)

### Opción A — Via GitHub (recomendado)

```bash
# 1. Inicializar repositorio
git init
git add .
git commit -m "Initial commit: MSN Products"

# 2. Crear repositorio en GitHub.com y subir
git remote add origin https://github.com/TU_USUARIO/msn-products.git
git push -u origin main
```

3. Ve a [vercel.com](https://vercel.com) → **Add New Project**
4. Conecta tu repositorio de GitHub
5. En **Environment Variables** agrega:

| Variable | Valor |
|---|---|
| `NEXTAUTH_SECRET` | Genera con: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://tudominio.com` (o URL de Vercel) |
| `NEXT_PUBLIC_SUPABASE_URL` | Tu URL de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Tu service role key |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `573001234567` (sin +) |
| `ADMIN_EMAIL` | `admin@msnproducts.com` |
| `ADMIN_PASSWORD` | Tu contraseña segura |

6. Haz clic en **Deploy** → Vercel construye y despliega automáticamente

### Opción B — Via Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

---

## 5. Conectar dominio personalizado

1. En Vercel → **Settings → Domains** → Agrega tu dominio
2. Vercel te muestra los registros DNS a configurar
3. En tu registrador (GoDaddy, Namecheap, etc.) → DNS Management:
   - Si usas el dominio raíz (`msnproducts.com.co`): Agrega registro `A` apuntando a IP de Vercel
   - Si usas subdominio (`www`): Agrega registro `CNAME` → `cname.vercel-dns.com`
4. Espera 5-30 minutos para propagación DNS
5. Vercel configura SSL automáticamente

---

## 6. SEO — Estrategia básica

### Ya implementado en el código:
- ✅ Títulos y descripciones optimizadas (`metadata` en cada page)
- ✅ Open Graph y Twitter Card para previews en redes sociales
- ✅ Sitemap automático en `/sitemap.xml`
- ✅ `robots.txt` bloqueando `/admin`
- ✅ Etiquetas `lang="es-CO"` para idioma
- ✅ `alt` en todas las imágenes

### Pasos adicionales recomendados:
1. **Google Search Console** → Agrega tu dominio → Sube sitemap
2. **Google My Business** → Crea perfil de negocio local (Bogotá/ciudad)
3. **Palabras clave** — Incluye en las descripciones:
   - "AirPods Colombia"
   - "Apple Watch Colombia"
   - "Accesorios Apple baratos"
   - "AirPods Bogotá / Medellín / Cali"
4. **Velocidad** — Vercel Edge Network ya optimiza velocidad globalmente

---

## 7. Mantenimiento

| Tarea | Dónde |
|---|---|
| Agregar/editar productos | `/admin/products` |
| Ver y gestionar stock | `/admin` (dashboard) |
| Revisar métricas | Vercel Analytics (gratis) |
| Backups de datos | Supabase → Database → Backups |

---

## 8. Variables de entorno requeridas (resumen)

```env
NEXTAUTH_SECRET=                    # openssl rand -base64 32
NEXTAUTH_URL=                       # https://tudominio.com
NEXT_PUBLIC_SUPABASE_URL=           # https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # ey...
SUPABASE_SERVICE_ROLE_KEY=          # ey... (¡SECRETO!)
NEXT_PUBLIC_WHATSAPP_NUMBER=        # 573XXXXXXXXX
ADMIN_EMAIL=                        # admin@tudominio.com
ADMIN_PASSWORD=                     # contraseña segura
```

> 🔐 **Nunca** subas `.env.local` a GitHub. El `.gitignore` ya lo excluye.

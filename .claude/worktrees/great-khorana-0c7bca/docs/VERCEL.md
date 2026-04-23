# Guía de Despliegue — MSN Products en Vercel

## Resumen

| Paso | Qué haces |
|------|-----------|
| 1 | Subir código a GitHub |
| 2 | Conectar repositorio con Vercel |
| 3 | Agregar variables de entorno en Vercel |
| 4 | Hacer clic en "Deploy" |
| 5 | (Opcional) Asignar dominio personalizado |

---

## 1. Subir el código a GitHub por primera vez

Ejecuta estos comandos **en orden** desde la carpeta del proyecto (`antigravity try 1`):

```bash
# 1. Inicializar Git en el proyecto
git init

# 2. Agregar todos los archivos (el .gitignore ya protege tus secretos)
git add .

# 3. Crear el primer commit
git commit -m "Initial commit — MSN Products"

# 4. Crear el repositorio en GitHub (requiere tener gh CLI instalado)
#    Si no tienes gh, crea el repo manualmente en github.com y copia la URL
gh repo create msn-products --public --source=. --remote=origin --push

# Si creaste el repo manualmente en github.com:
git remote add origin https://github.com/TU_USUARIO/msn-products.git
git branch -M main
git push -u origin main
```

> **¿Cómo instalar gh CLI?** → https://cli.github.com/
> Alternativamente usa GitHub Desktop o crea el repo en github.com y sigue las instrucciones de "push existing repository".

### Verificar que tus secretos NO están en el repo

Antes del push confirma que estos archivos NO aparecen en `git status`:
- `.env`
- `.env.local`
- `.env*.local`

El `.gitignore` ya los bloquea. Si alguno aparece en rojo en `git status`, **no hagas push** y ejecuta:
```bash
git rm --cached .env.local
```

---

## 2. Conectar GitHub con Vercel

1. Ve a **[vercel.com](https://vercel.com)** → "Sign Up" con tu cuenta de GitHub
2. En el dashboard haz clic en **"Add New… → Project"**
3. Busca el repositorio `msn-products` y haz clic en **"Import"**
4. En la pantalla de configuración:
   - **Framework Preset**: Next.js (se detecta automáticamente)
   - **Root Directory**: `.` (dejar por defecto)
   - **Build Command**: `npm run build` (dejar por defecto)
   - **Output Directory**: `.next` (dejar por defecto)
5. **Antes de hacer clic en Deploy**, agrega las variables de entorno (ver sección 3)

---

## 3. Variables de entorno en Vercel

Ve a **Settings → Environment Variables** en tu proyecto de Vercel y agrega **exactamente** estas variables:

### Supabase (obligatorias)

| Variable | Dónde encontrarla |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key ⚠️ |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` es secreta. En Vercel marca el entorno como **Production** y **Preview** pero nunca la expongas en el cliente.

### Autenticación (obligatorias)

| Variable | Valor |
|---|---|
| `NEXTAUTH_SECRET` | Una cadena aleatoria de 32+ caracteres. Genera una con: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | La URL de tu app en Vercel, ej: `https://msn-products.vercel.app` |

> ⚠️ Después de asignar un dominio personalizado, actualiza `NEXTAUTH_URL` con la URL final.

### MercadoPago (opcional — requerido para pagos reales)

| Variable | Valor |
|---|---|
| `MERCADOPAGO_ACCESS_TOKEN` | Tu Access Token de producción desde mercadopago.com.co → Credenciales |
| `NEXT_PUBLIC_BASE_URL` | Tu URL pública, ej: `https://msn-products.vercel.app` |

> Para pruebas usa el token que empieza con `TEST-`. Para cobros reales usa el token de **Producción** (`APP_USR-...`).

### Nequi (opcional — solo si integraste Push Payments directos)

| Variable | Valor |
|---|---|
| `NEQUI_CLIENT_ID` | Tu Client ID del portal de desarrolladores Nequi |
| `NEQUI_CLIENT_SECRET` | Tu Client Secret de Nequi |
| `NEQUI_API_URL` | `https://api.nequi.com.co` (producción) |

### Selección de entornos

Para cada variable, marca los entornos donde aplica:

| Variable | Production | Preview | Development |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ | ❌ |
| `NEXTAUTH_SECRET` | ✅ | ✅ | ❌ |
| `NEXTAUTH_URL` | ✅ | ❌ | ❌ |
| `MERCADOPAGO_ACCESS_TOKEN` | ✅ | ❌ | ❌ |
| `NEXT_PUBLIC_BASE_URL` | ✅ | ✅ | ❌ |

---

## 4. Primer despliegue

1. Con las variables configuradas, haz clic en **"Deploy"**
2. Vercel ejecuta `npm run build` — si el build local pasa, el de Vercel también pasa
3. En ~2 minutos verás `✅ Deployment completed`
4. Tu tienda estará en: `https://msn-products-xxxx.vercel.app`

### Actualizaciones futuras

Cada vez que hagas `git push origin main`, Vercel redesplegará automáticamente:

```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```

---

## 5. Dominio personalizado

### 5a. Cambiar el subdominio de Vercel

Puedes cambiar `msn-products-xxxx.vercel.app` por `msnproducts.vercel.app`:

1. Vercel Dashboard → tu proyecto → **Settings → Domains**
2. Haz clic en **"Edit"** junto al dominio actual
3. Escribe el nombre que quieras: `msnproducts.vercel.app`
4. Guarda — el cambio es inmediato
5. Actualiza `NEXTAUTH_URL` y `NEXT_PUBLIC_BASE_URL` con la nueva URL

### 5b. Dominio propio (.com, .com.co, etc.)

Cuando compres un dominio (ej: `msnproducts.com.co` en NIC.CO o Namecheap):

1. Vercel → Settings → Domains → **"Add"**
2. Escribe `msnproducts.com.co` y haz clic en **"Add"**
3. Vercel te mostrará dos opciones:
   - **Opción A — Nameservers (recomendada)**: Cambia los nameservers de tu registrador a los de Vercel (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`). Vercel gestiona todo automáticamente.
   - **Opción B — DNS Records**: Agrega un registro `A` apuntando a `76.76.21.21` y un `CNAME www` apuntando a `cname.vercel-dns.com`.
4. La propagación tarda entre 5 minutos y 24 horas
5. Vercel provisiona el certificado SSL (HTTPS) automáticamente — no pagas nada extra
6. **Actualiza variables de entorno**:
   - `NEXTAUTH_URL` → `https://msnproducts.com.co`
   - `NEXT_PUBLIC_BASE_URL` → `https://msnproducts.com.co`
   - En MercadoPago: actualiza las `back_urls` o el webhook URL si las configuraste manualmente

---

## 6. Webhook de MercadoPago en producción

Una vez tengas tu dominio final, registra el webhook en MercadoPago:

1. mercadopago.com.co → Tu negocio → **Notificaciones IPN/Webhooks**
2. URL del webhook: `https://TU_DOMINIO/api/mercadopago/webhook`
3. Eventos a suscribir: `payment`

---

## Checklist de producción

- [ ] `git push origin main` — código subido a GitHub
- [ ] Variables de entorno configuradas en Vercel (especialmente `NEXTAUTH_SECRET` y `NEXTAUTH_URL`)
- [ ] Build exitoso en Vercel (`✅ Deployment completed`)
- [ ] Abrir la URL pública y probar: agregar al carrito, ir al checkout, ver el panel `/admin`
- [ ] Si usas MercadoPago real: agregar webhook URL en tu cuenta de MP
- [ ] Dominio personalizado configurado (opcional)
- [ ] `NEXTAUTH_URL` y `NEXT_PUBLIC_BASE_URL` actualizados con el dominio final

---

## Solución de problemas frecuentes

| Error en Vercel | Causa | Solución |
|---|---|---|
| `Error: Missing NEXTAUTH_SECRET` | Variable no configurada | Agregar en Vercel → Environment Variables |
| `Error: Invalid URL` en auth | `NEXTAUTH_URL` vacío o incorrecto | Poner la URL exacta con `https://` |
| Imágenes de Supabase no cargan | URL de Supabase diferente | Verificar `NEXT_PUBLIC_SUPABASE_URL` en Vercel |
| Build falla por tipo TS | Código con errores TypeScript | Correr `npx tsc --noEmit` localmente primero |
| Admin no puede iniciar sesión | `NEXTAUTH_URL` no coincide con dominio | Actualizar la variable al dominio de Vercel |

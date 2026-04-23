/**
 * Script to create the initial admin user.
 * Run ONCE after setting up Supabase:
 *   npx tsx scripts/seed-admin.ts
 *
 * Make sure SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL are in .env.local
 */

import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@msnproducts.com'
  const plainPassword = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!'

  const hash = await bcrypt.hash(plainPassword, 12)

  const { data, error } = await supabase
    .from('admin_users')
    .upsert({ email, password: hash }, { onConflict: 'email' })
    .select()

  if (error) {
    console.error('Error creating admin user:', error)
    process.exit(1)
  }

  console.log('Admin user created/updated:', data)
  console.log('Email:', email)
  console.log('Password:', plainPassword)
  console.log('\n⚠️  Change your password after first login!')
}

main()

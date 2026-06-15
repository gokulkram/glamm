/**
 * seed.mjs — Seeds categories & products into the new Supabase project
 * Run: node --env-file=.env.local seed.mjs
 *  or: set SUPABASE_SERVICE_ROLE_KEY=<key> && node seed.mjs
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ROLE_KEY, { auth: { persistSession: false } })

const categories = [
  { name: 'Wavy',     slug: 'wavy',     sort_order: 1 },
  { name: 'Straight', slug: 'straight', sort_order: 2 },
  { name: 'Curly',    slug: 'curly',    sort_order: 3 },
  { name: 'Closures', slug: 'closures', sort_order: 4 },
]

const products = [
  { id:1,  slug:'lace-frontal-13x4', title:'Lace Frontal 13X4',  description:'Premium HD lace frontal for a natural hairline. 13x4 size provides ear-to-ear coverage with versatile parting options.', category:'closures', price_min:108, price_max:178, badge:'Best Seller', sort_order:1,  sizes:['10"','12"','14"','16"','18"','20"','22"','24"'], sizes_prices:{'10"':108,'12"':118,'14"':128,'16"':144,'18"':150,'20"':158,'22"':170,'24"':178}, in_stock:true, features:['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'], benefits:['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'] },
  { id:2,  slug:'hd-4x4-closure',    title:'HD 4X4 closure',     description:'HD lace 4x4 closure for seamless blending. Perfect for creating natural-looking parts and protecting your natural hair.', category:'closures', price_min:70,  price_max:128, badge:'Best Seller', sort_order:2,  sizes:['10"','12"','14"','16"','18"','20"','22"','24"'], sizes_prices:{'10"':70,'12"':76,'14"':85,'16"':90,'18"':96,'20"':110,'22"':118,'24"':128}, in_stock:true, features:['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'], benefits:['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'] },
  { id:3,  slug:'hd-5x5-closure',    title:'HD 5X5 closure',     description:'Larger 5x5 HD lace closure offering more parting space and styling versatility. Undetectable and natural-looking.', category:'closures', price_min:78,  price_max:138, badge:'Best Seller', sort_order:3,  sizes:['10"','12"','14"','16"','18"','20"','22"'], sizes_prices:{'10"':78,'12"':90,'14"':98,'16"':108,'18"':118,'20"':126,'22"':138}, in_stock:true, features:['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'], benefits:['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'] },
  { id:4,  slug:'hd-2x6-closure',    title:'HD 2X6 closure',     description:'Slim 2x6 HD lace closure perfect for middle parts. Lightweight and natural with invisible knots.', category:'closures', price_min:70,  price_max:106, badge:'Best Seller', sort_order:4,  sizes:['10"','12"','14"','16"','18"','20"'], sizes_prices:{'10"':70,'12"':78,'14"':84,'16"':92,'18"':98,'20"':106}, in_stock:true, features:['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'], benefits:['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'] },
  { id:5,  slug:'tight-curly',       title:'Tight Curly',        description:'Tight, bouncy curls with maximum volume. Perfect for achieving a bold, voluminous look with defined ringlets.', category:'curly',    price_min:44,  price_max:145, badge:null,          sort_order:5,  sizes:['10"','12"','14"','16"','18"','20"','22"','24"','26"','28"','30"','32"'], sizes_prices:{'10"':44,'12"':48,'14"':62,'16"':74,'18"':80,'20"':83,'22"':86,'24"':112,'26"':118,'28"':120,'30"':136,'32"':145}, in_stock:true, features:['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'], benefits:['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'] },
  { id:6,  slug:'indian-curl',       title:'Indian Curl',        description:'Luxurious Indian curls with natural bounce and shine. Soft, silky texture that holds curls beautifully.', category:'curly',    price_min:44,  price_max:145, badge:'Best Seller', sort_order:6,  sizes:['10"','12"','14"','16"','18"','20"','22"','24"','26"','28"','30"','32"'], sizes_prices:{'10"':44,'12"':48,'14"':62,'16"':74,'18"':80,'20"':83,'22"':86,'24"':112,'26"':118,'28"':120,'30"':136,'32"':145}, in_stock:true, features:['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'], benefits:['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'] },
  { id:7,  slug:'burmese-curl',      title:'Burmese Curl',       description:'Luxurious Burmese curl pattern with defined, bouncy curls. Holds curl pattern beautifully even after washing.', category:'curly',    price_min:44,  price_max:145, badge:null,          sort_order:7,  sizes:['10"','12"','14"','16"','18"','20"','22"','24"','26"','28"','30"','32"'], sizes_prices:{'10"':44,'12"':48,'14"':62,'16"':74,'18"':80,'20"':83,'22"':86,'24"':112,'26"':118,'28"':120,'30"':136,'32"':145}, in_stock:true, features:['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'], benefits:['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'] },
  { id:8,  slug:'italian-curl',      title:'Italian Curl',       description:'Elegant Italian curl with loose, romantic curls. Perfect for a glamorous, red-carpet look.', category:'curly',    price_min:44,  price_max:145, badge:null,          sort_order:8,  sizes:['10"','12"','14"','16"','18"','20"','22"','24"','26"','28"','30"','32"'], sizes_prices:{'10"':44,'12"':48,'14"':62,'16"':74,'18"':80,'20"':83,'22"':86,'24"':112,'26"':118,'28"':120,'30"':136,'32"':145}, in_stock:true, features:['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'], benefits:['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'] },
  { id:9,  slug:'natural-wave',      title:'Natural Wave',       description:'Soft, natural waves for an effortless beachy look. Versatile texture that can be styled straight or curly.', category:'wavy',     price_min:44,  price_max:145, badge:'Best Seller', sort_order:9,  sizes:['10"','12"','14"','16"','18"','20"','22"','24"','26"','28"','30"','32"'], sizes_prices:{'10"':44,'12"':48,'14"':62,'16"':74,'18"':80,'20"':83,'22"':86,'24"':112,'26"':118,'28"':120,'30"':136,'32"':145}, in_stock:true, features:['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'], benefits:['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'] },
  { id:10, slug:'deep-wave',         title:'Deep Wave',          description:'Glamorous deep waves with defined S-pattern. Adds volume and movement for a sophisticated look.', category:'wavy',     price_min:44,  price_max:145, badge:'Best Seller', sort_order:10, sizes:['10"','12"','14"','16"','18"','20"','22"','24"','26"','28"','30"','32"'], sizes_prices:{'10"':44,'12"':48,'14"':62,'16"':74,'18"':80,'20"':83,'22"':86,'24"':112,'26"':118,'28"':120,'30"':136,'32"':145}, in_stock:true, features:['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'], benefits:['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'] },
  { id:11, slug:'indian-wave',       title:'Indian Wave',        description:'Beautiful Indian wave texture with natural movement and shine. Versatile styling options from sleek to voluminous.', category:'wavy',     price_min:44,  price_max:145, badge:null,          sort_order:11, sizes:['10"','12"','14"','16"','18"','20"','22"','24"','26"','28"','30"','32"'], sizes_prices:{'10"':44,'12"':48,'14"':62,'16"':74,'18"':80,'20"':83,'22"':86,'24"':112,'26"':118,'28"':120,'30"':136,'32"':145}, in_stock:true, features:['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'], benefits:['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'] },
  { id:12, slug:'kinky-straight',    title:'Kinky Straight',     description:'Natural kinky straight texture that blends seamlessly with relaxed or natural hair. Mimics blown-out natural hair.', category:'straight', price_min:44,  price_max:145, badge:null,          sort_order:12, sizes:['10"','12"','14"','16"','18"','20"','22"','24"','26"','28"','30"','32"'], sizes_prices:{'10"':44,'12"':48,'14"':62,'16"':74,'18"':80,'20"':83,'22"':86,'24"':112,'26"':118,'28"':120,'30"':136,'32"':145}, in_stock:true, features:['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'], benefits:['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'] },
  { id:13, slug:'straight',          title:'Straight',           description:'Sleek, silky straight hair for a classic, polished look. Can be curled or styled as desired.', category:'straight', price_min:44,  price_max:145, badge:'Best Seller', sort_order:13, sizes:['10"','12"','14"','16"','18"','20"','22"','24"','26"','28"','30"','32"'], sizes_prices:{'10"':44,'12"':48,'14"':62,'16"':74,'18"':80,'20"':83,'22"':86,'24"':112,'26"':118,'28"':120,'30"':136,'32"':145}, in_stock:true, features:['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'], benefits:['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'] },
]

async function seed() {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║   Glamm Hair — Supabase Seed Script      ║')
  console.log('║   Project: sysbekcoasfkeknpyafc          ║')
  console.log('╚══════════════════════════════════════════╝\n')

  // ── Categories ──────────────────────────────────────────
  console.log('📂 Seeding categories...')
  for (const cat of categories) {
    const { error } = await supabase
      .from('categories')
      .upsert(cat, { onConflict: 'slug' })
    if (error) {
      console.error(`  ✗ ${cat.name}: ${error.message}`)
    } else {
      console.log(`  ✓ ${cat.name}`)
    }
  }

  // ── Products ─────────────────────────────────────────────
  console.log('\n💇 Seeding products...')
  for (const p of products) {
    const { error } = await supabase
      .from('products')
      .upsert({
        id:           p.id,
        slug:         p.slug,
        title:        p.title,
        description:  p.description,
        category:     p.category,
        price_min:    p.price_min,
        price_max:    p.price_max,
        sizes:        p.sizes,
        sizes_prices: p.sizes_prices,
        in_stock:     p.in_stock,
        badge:        p.badge ?? null,
        features:     p.features,
        benefits:     p.benefits,
        sort_order:   p.sort_order,
      }, { onConflict: 'id' })

    if (error) {
      console.error(`  ✗ [${p.id}] ${p.title}: ${error.message}`)
    } else {
      console.log(`  ✓ [${p.id}] ${p.title}`)
    }
  }

  // ── Verify ────────────────────────────────────────────────
  console.log('\n🔍 Verifying...')
  const { data: cats,  error: ce } = await supabase.from('categories').select('name')
  const { data: prods, error: pe } = await supabase.from('products').select('id, title').order('sort_order')

  if (ce || pe) {
    console.error('  Verification error:', ce?.message || pe?.message)
  } else {
    console.log(`\n  ✅ Categories (${cats.length}):`, cats.map(c => c.name).join(', '))
    console.log(`  ✅ Products   (${prods.length}):`)
    prods.forEach(p => console.log(`     [${p.id}] ${p.title}`))
  }

  console.log('\n✅ All done! Your new Supabase project is ready.\n')
}

seed().catch(err => {
  console.error('❌ Fatal:', err.message)
  process.exit(1)
})

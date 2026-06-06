import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'bp9hjzzr',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

// Categories to create
const categories = [
  { name: 'Wavy', slug: 'wavy' },
  { name: 'Straight', slug: 'straight' },
  { name: 'Curly', slug: 'curly' },
  { name: 'Closures', slug: 'closures' },
]

// Products to migrate
const products = [
  {
    title: 'Lace Frontal 13X4',
    slug: 'lace-frontal-13x4',
    description: 'Premium HD lace frontal for a natural hairline. 13x4 size provides ear-to-ear coverage with versatile parting options.',
    category: 'closures',
    priceMin: 108,
    priceMax: 178,
    sizes: ['10"', '12"', '14"', '16"', '18"', '20"', '22"', '24"'],
    sizes_prices: [
      {size: '10"', price: 108}, {size: '12"', price: 118}, {size: '14"', price: 128}, {size: '16"', price: 144},
      {size: '18"', price: 150}, {size: '20"', price: 158}, {size: '22"', price: 170}, {size: '24"', price: 178}
    ],
    inStock: true,
    badge: 'Best Seller',
    features: ['100% Virgin Human Hair', 'Can be dyed and styled', 'Natural shine and softness', 'Tangle-free with proper care'],
    benefits: ['Long-lasting with proper care (6-12 months)', 'Heat-friendly up to 350°F', 'Minimal shedding', 'True to length']
  },
  {
    title: 'HD 4X4 closure',
    slug: 'hd-4x4-closure',
    description: 'HD lace 4x4 closure for seamless blending. Perfect for creating natural-looking parts and protecting your natural hair.',
    category: 'closures',
    priceMin: 70,
    priceMax: 128,
    sizes: ['10"', '12"', '14"', '16"', '18"', '20"', '22"', '24"'],
    sizes_prices: [
      {size: '10"', price: 70}, {size: '12"', price: 76}, {size: '14"', price: 85}, {size: '16"', price: 90},
      {size: '18"', price: 96}, {size: '20"', price: 110}, {size: '22"', price: 118}, {size: '24"', price: 128}
    ],
    inStock: true,
    badge: 'Best Seller',
    features: ['100% Virgin Human Hair', 'Can be dyed and styled', 'Natural shine and softness', 'Tangle-free with proper care'],
    benefits: ['Long-lasting with proper care (6-12 months)', 'Heat-friendly up to 350°F', 'Minimal shedding', 'True to length']
  },
  {
    title: 'HD 5X5 closure',
    slug: 'hd-5x5-closure',
    description: 'Larger 5x5 HD lace closure offering more parting space and styling versatility. Undetectable and natural-looking.',
    category: 'closures',
    priceMin: 78,
    priceMax: 138,
    sizes: ['10"', '12"', '14"', '16"', '18"', '20"', '22"'],
    sizes_prices: [
      {size: '10"', price: 78}, {size: '12"', price: 90}, {size: '14"', price: 98}, {size: '16"', price: 108},
      {size: '18"', price: 118}, {size: '20"', price: 126}, {size: '22"', price: 138}
    ],
    inStock: true,
    badge: 'Best Seller',
    features: ['100% Virgin Human Hair', 'Can be dyed and styled', 'Natural shine and softness', 'Tangle-free with proper care'],
    benefits: ['Long-lasting with proper care (6-12 months)', 'Heat-friendly up to 350°F', 'Minimal shedding', 'True to length']
  },
  {
    title: 'HD 2X6 closure',
    slug: 'hd-2x6-closure',
    description: 'Slim 2x6 HD lace closure perfect for middle parts. Lightweight and natural with invisible knots.',
    category: 'closures',
    priceMin: 70,
    priceMax: 106,
    sizes: ['10"', '12"', '14"', '16"', '18"', '20"'],
    sizes_prices: [
      {size: '10"', price: 70}, {size: '12"', price: 78}, {size: '14"', price: 84}, {size: '16"', price: 92},
      {size: '18"', price: 98}, {size: '20"', price: 106}
    ],
    inStock: true,
    badge: 'Best Seller',
    features: ['100% Virgin Human Hair', 'Can be dyed and styled', 'Natural shine and softness', 'Tangle-free with proper care'],
    benefits: ['Long-lasting with proper care (6-12 months)', 'Heat-friendly up to 350°F', 'Minimal shedding', 'True to length']
  },
  {
    title: 'Tight Curly',
    slug: 'tight-curly',
    description: 'Tight, bouncy curls with maximum volume. Perfect for achieving a bold, voluminous look with defined ringlets.',
    category: 'curly',
    priceMin: 44,
    priceMax: 145,
    sizes: ['10"', '12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"', '28"', '30"', '32"'],
    sizes_prices: [
      {size: '10"', price: 44}, {size: '12"', price: 48}, {size: '14"', price: 62}, {size: '16"', price: 74},
      {size: '18"', price: 80}, {size: '20"', price: 83}, {size: '22"', price: 86}, {size: '24"', price: 112},
      {size: '26"', price: 118}, {size: '28"', price: 120}, {size: '30"', price: 136}, {size: '32"', price: 145}
    ],
    inStock: true,
    features: ['100% Virgin Human Hair', 'Can be dyed and styled', 'Natural shine and softness', 'Tangle-free with proper care'],
    benefits: ['Long-lasting with proper care (6-12 months)', 'Heat-friendly up to 350°F', 'Minimal shedding', 'True to length']
  },
  {
    title: 'Indian Curl',
    slug: 'indian-curl',
    description: 'Luxurious Indian curls with natural bounce and shine. Soft, silky texture that holds curls beautifully.',
    category: 'curly',
    priceMin: 44,
    priceMax: 145,
    sizes: ['10"', '12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"', '28"', '30"', '32"'],
    sizes_prices: [
      {size: '10"', price: 44}, {size: '12"', price: 48}, {size: '14"', price: 62}, {size: '16"', price: 74},
      {size: '18"', price: 80}, {size: '20"', price: 83}, {size: '22"', price: 86}, {size: '24"', price: 112},
      {size: '26"', price: 118}, {size: '28"', price: 120}, {size: '30"', price: 136}, {size: '32"', price: 145}
    ],
    inStock: true,
    badge: 'Best Seller',
    features: ['100% Virgin Human Hair', 'Can be dyed and styled', 'Natural shine and softness', 'Tangle-free with proper care'],
    benefits: ['Long-lasting with proper care (6-12 months)', 'Heat-friendly up to 350°F', 'Minimal shedding', 'True to length']
  },
  {
    title: 'Natural Wave',
    slug: 'natural-wave',
    description: 'Soft, natural waves for an effortless beachy look. Versatile texture that can be styled straight or curly.',
    category: 'wavy',
    priceMin: 44,
    priceMax: 145,
    sizes: ['10"', '12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"', '28"', '30"', '32"'],
    sizes_prices: [
      {size: '10"', price: 44}, {size: '12"', price: 48}, {size: '14"', price: 62}, {size: '16"', price: 74},
      {size: '18"', price: 80}, {size: '20"', price: 83}, {size: '22"', price: 86}, {size: '24"', price: 112},
      {size: '26"', price: 118}, {size: '28"', price: 120}, {size: '30"', price: 136}, {size: '32"', price: 145}
    ],
    inStock: true,
    badge: 'Best Seller',
    features: ['100% Virgin Human Hair', 'Can be dyed and styled', 'Natural shine and softness', 'Tangle-free with proper care'],
    benefits: ['Long-lasting with proper care (6-12 months)', 'Heat-friendly up to 350°F', 'Minimal shedding', 'True to length']
  },
  {
    title: 'Deep Wave',
    slug: 'deep-wave',
    description: 'Glamorous deep waves with defined S-pattern. Adds volume and movement for a sophisticated look.',
    category: 'wavy',
    priceMin: 44,
    priceMax: 145,
    sizes: ['10"', '12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"', '28"', '30"', '32"'],
    sizes_prices: [
      {size: '10"', price: 44}, {size: '12"', price: 48}, {size: '14"', price: 62}, {size: '16"', price: 74},
      {size: '18"', price: 80}, {size: '20"', price: 83}, {size: '22"', price: 86}, {size: '24"', price: 112},
      {size: '26"', price: 118}, {size: '28"', price: 120}, {size: '30"', price: 136}, {size: '32"', price: 145}
    ],
    inStock: true,
    badge: 'Best Seller',
    features: ['100% Virgin Human Hair', 'Can be dyed and styled', 'Natural shine and softness', 'Tangle-free with proper care'],
    benefits: ['Long-lasting with proper care (6-12 months)', 'Heat-friendly up to 350°F', 'Minimal shedding', 'True to length']
  },
]

async function migrate() {
  console.log('Starting migration...')
  
  // Create categories first
  const categoryRefs = {}
  for (const cat of categories) {
    const doc = await client.createOrReplace({
      _id: `category-${cat.slug}`,
      _type: 'category',
      name: cat.name,
      slug: { _type: 'slug', current: cat.slug },
    })
    categoryRefs[cat.slug] = doc._id
    console.log(`✓ Created category: ${cat.name}`)
  }
  
  // Create products
  for (const product of products) {
    await client.createOrReplace({
      _id: `product-${product.slug}`,
      _type: 'product',
      title: product.title,
      slug: { _type: 'slug', current: product.slug },
      description: product.description,
      category: { _type: 'reference', _ref: categoryRefs[product.category] },
      priceMin: product.priceMin,
      priceMax: product.priceMax,
      sizes: product.sizes,
      sizes_prices: product.sizes_prices,
      inStock: product.inStock,
      badge: product.badge || '',
      features: product.features,
      benefits: product.benefits,
    })
    console.log(`✓ Created product: ${product.title}`)
  }
  
  // Create site settings
  await client.createOrReplace({
    _id: 'siteSettings',
    _type: 'siteSettings',
    siteName: 'Glamm Hair',
    tagline: 'Premium Hair Extensions',
    heroTitle: 'Luxury Hair Extensions',
    heroSubtitle: 'Transform your look with our premium quality virgin hair extensions',
    contactEmail: 'hello@glammhair.com',
    contactPhone: '',
    address: '',
  })
  console.log('✓ Created site settings')
  
  console.log('\n✅ Migration complete! Check your Sanity Studio.')
}

migrate().catch(console.error)


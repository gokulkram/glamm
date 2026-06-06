import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'bp9hjzzr',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

// New products to add
const newProducts = [
  {
    title: 'Indian Wave',
    slug: 'indian-wave',
    description: 'Beautiful Indian wave texture with natural movement and shine. Versatile styling options from sleek to voluminous.',
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
    features: ['100% Virgin Human Hair', 'Can be dyed and styled', 'Natural shine and softness', 'Tangle-free with proper care'],
    benefits: ['Long-lasting with proper care (6-12 months)', 'Heat-friendly up to 350°F', 'Minimal shedding', 'True to length']
  },
  {
    title: 'Burmese Curl',
    slug: 'burmese-curl',
    description: 'Luxurious Burmese curl pattern with defined, bouncy curls. Holds curl pattern beautifully even after washing.',
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
    title: 'Italian Curl',
    slug: 'italian-curl',
    description: 'Elegant Italian curl with loose, romantic curls. Perfect for a glamorous, red-carpet look.',
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
    title: 'Kinky Straight',
    slug: 'kinky-straight',
    description: 'Natural kinky straight texture that blends seamlessly with relaxed or natural hair. Mimics blown-out natural hair.',
    category: 'straight',
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
    title: 'Straight',
    slug: 'straight',
    description: 'Sleek, silky straight hair for a classic, polished look. Can be curled or styled as desired.',
    category: 'straight',
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
  console.log('Adding 5 new products...')
  
  // Get category references
  const categoryRefs = {
    'wavy': 'category-wavy',
    'curly': 'category-curly',
    'straight': 'category-straight',
    'closures': 'category-closures',
  }
  
  // Create products
  for (const product of newProducts) {
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
    console.log(`✓ Added: ${product.title}`)
  }
  
  console.log('\n✅ All 5 new products added! Total: 13 products')
}

migrate().catch(console.error)


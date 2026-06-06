import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: 'bp9hjzzr',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

// Fetch all products
export async function getProducts() {
  return client.fetch(`
    *[_type == "product"] | order(title asc) {
      _id,
      title,
      slug,
      description,
      category->{name, slug},
      priceMin,
      priceMax,
      image,
      sizes,
      sizes_prices,
      inStock,
      badge,
      features,
      benefits
    }
  `)
}

// Fetch single product by slug
export async function getProduct(slug: string) {
  return client.fetch(`
    *[_type == "product" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      category->{name, slug},
      priceMin,
      priceMax,
      image,
      sizes,
      sizes_prices,
      inStock,
      badge,
      features,
      benefits
    }
  `, { slug })
}

// Fetch all categories
export async function getCategories() {
  return client.fetch(`
    *[_type == "category"] | order(name asc) {
      _id,
      name,
      slug,
      "count": count(*[_type == "product" && references(^._id)])
    }
  `)
}

// Fetch site settings
export async function getSiteSettings() {
  return client.fetch(`
    *[_type == "siteSettings"][0] {
      siteName,
      tagline,
      heroTitle,
      heroSubtitle,
      contactEmail,
      contactPhone,
      address,
      socialLinks
    }
  `)
}


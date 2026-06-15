import fs from 'fs'
import { parse } from 'csv-parse'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ROLE_KEY, { auth: { persistSession: false } })

const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${filePath} (file not found)`)
      return resolve([])
    }
    
    const results = []
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err))
  })
}

const parseJSONFields = (row, fields) => {
  const newRow = { ...row }
  for (const field of fields) {
    if (newRow[field]) {
      try {
        newRow[field] = JSON.parse(newRow[field])
      } catch (e) {
        // If it fails to parse, leave it as string or fallback
      }
    }
  }
  return newRow
}

const nullifyEmpty = (row) => {
  const newRow = {}
  for (const key in row) {
    if (row[key] === '') {
      newRow[key] = null
    } else {
      newRow[key] = row[key]
    }
  }
  return newRow
}

async function importData() {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║   Glamm Hair — Supabase CSV Import       ║')
  console.log('╚══════════════════════════════════════════╝\n')

  const tables = [
    { name: 'categories', file: 'supabase/categories_rows.csv', pk: 'id' },
    { 
      name: 'products', 
      file: 'supabase/products_rows.csv', 
      pk: 'id',
      jsonFields: ['sizes', 'sizes_prices', 'features', 'benefits']
    },
    { name: 'customers', file: 'supabase/customers_rows.csv', pk: 'id' },
    { name: 'addresses', file: 'supabase/addresses_rows.csv', pk: 'id' },
    { name: 'orders', file: 'supabase/orders_rows.csv', pk: 'id' },
    { name: 'order_items', file: 'supabase/order_items_rows.csv', pk: 'id' },
    { name: 'admins', file: 'supabase/admins_rows.csv', pk: 'id' }
  ]

  for (const table of tables) {
    console.log(`\n📄 Importing ${table.name}...`)
    let rows = await parseCSV(table.file)
    
    if (rows.length === 0) continue
    
    // Pre-process rows
    rows = rows.map(row => {
      let r = nullifyEmpty(row)
      if (table.jsonFields) {
        r = parseJSONFields(r, table.jsonFields)
      }
      return r
    })

    // Upsert in batches of 100 to avoid large payload errors
    const batchSize = 100
    let successCount = 0
    let failCount = 0
    
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize)
      const { error } = await supabase.from(table.name).upsert(batch, { onConflict: table.pk })
      
      if (error) {
        console.error(`  ✗ Error in batch ${i/batchSize + 1}:`, error.message)
        failCount += batch.length
      } else {
        successCount += batch.length
      }
    }
    
    console.log(`  ✓ Successfully imported ${successCount} rows into ${table.name}`)
    if (failCount > 0) {
      console.log(`  ⚠ Failed to import ${failCount} rows`)
    }
  }

  console.log('\n✅ CSV Import complete!\n')
}

importData().catch(err => {
  console.error('❌ Fatal:', err.message)
  process.exit(1)
})

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// Function to fetch restaurant data
async function fetchRestaurantData(restaurantId) {
  try {
    const apiBase = process.env.API_BASE_URL
    const response = await fetch(`${apiBase}/menu/public/${restaurantId}`)
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.warn(`Failed to fetch data for restaurant ${restaurantId}:`, error)
    return null
  }
}

// Function to fetch all restaurants (internal, secret-protected)
async function fetchAllRestaurants() {
  try {
    const apiBase = process.env.API_BASE_URL
    const secret = process.env.SSG_BUILD_SECRET
    const response = await fetch(`${apiBase}/restaurants/ssg/list`, {
      headers: {
        'x-ssg-secret': secret || ''
      }
    })
    const data = await response.json()
    const list = data?.data?.restaurants || []
    return list
  } catch (error) {
    console.warn('Failed to fetch restaurants:', error)
    return []
  }
}

// Main pre-rendering function
async function preRender() {
  console.log('Starting pre-rendering...')
  
  try {
    // Fetch all restaurants
    const restaurants = await fetchAllRestaurants()
    console.log(`Found ${restaurants.length} restaurants`)

    // Ensure dist directory exists
    const distDir = path.resolve(__dirname, '../dist')
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true })
    }

    // Read the built client template (contains hashed assets)
    const templatePath = path.join(distDir, 'index.html')
    if (!fs.existsSync(templatePath)) {
      throw new Error('Built template dist/index.html not found. Run "npm run build" first.')
    }
    const baseTemplate = fs.readFileSync(templatePath, 'utf-8')

    // Pre-render each restaurant's menu
    for (const restaurant of restaurants) {
      const restaurantId = restaurant.id
      console.log(`Pre-rendering menu for ${restaurant.name} (${restaurantId})`)

      // Fetch restaurant-specific data
      const menuData = await fetchRestaurantData(restaurantId)
      if (!menuData) {
        console.warn(`Skipping ${restaurant.name} - no data available`)
        continue
      }

      // Create restaurant-specific directory
      const restaurantDir = path.join(distDir, 'menu', restaurantId)
      fs.mkdirSync(restaurantDir, { recursive: true })

      // Generate app HTML to inject into #root and a preload script
      const appHtml = generateAppHtml(restaurant, menuData)
      const preloadScript = `\n<script>window.__PRELOADED_MENU__ = ${JSON.stringify({
        restaurant: menuData.restaurant,
        categories: menuData.categories,
        menuItems: menuData.menuItems,
        tags: menuData.tags || []
      })};<\/script>`

      // Inject into template: title, root content, and preloaded data
      let finalHtml = baseTemplate
        .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(
          `${restaurant.name} | Digital Menu`
        )}</title>`) 
        .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>${preloadScript}`)

      // Write HTML file
      const htmlPath = path.join(restaurantDir, 'index.html')
      fs.writeFileSync(htmlPath, finalHtml)

      console.log(`✓ Generated ${htmlPath}`)
    }

    console.log('Pre-rendering completed successfully!')
  } catch (error) {
    console.error('Pre-rendering failed:', error)
    process.exit(1)
  }
}

// Escape basic HTML entities for safe injection into template title
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Function to generate only the app HTML (root content)
function generateAppHtml(restaurant, menuData) {
  return `
    <div class="min-h-screen bg-surface pb-20">
      <header class="sticky top-0 z-40 bg-surface border-b border-border shadow-sm">
        <div class="px-4 py-3">
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0">
              ${restaurant.logoUrl ? 
                `<img src="${restaurant.logoUrl}" alt="${restaurant.name} logo" class="w-16 h-16 rounded-lg object-cover">` :
                `<div class="w-16 h-16 rounded-lg bg-primary flex items-center justify-center"></div>`
              }
            </div>
            <div class="flex-1 min-w-0">
              <h1 class="font-semibold text-lg text-text-primary truncate">${escapeHtml(restaurant.name)}</h1>
              <p class="text-sm text-text-secondary">Digital Menu</p>
            </div>
          </div>
        </div>
      </header>
      <main class="px-4 py-6">
        ${generateMenuContent(menuData)}
      </main>
    </div>
  `
}

// Function to generate menu content
function generateMenuContent(menuData) {
  if (!menuData.categories || menuData.categories.length === 0) {
    return '<div class="text-center py-12"><p class="text-text-secondary">No menu items available</p></div>'
  }
  
  let content = ''
  
  for (const category of menuData.categories) {
    const categoryItems = menuData.menuItems.filter(item => 
      item.categoryIds?.some(cat => cat.id === category.id)
    )
    
    if (categoryItems.length === 0) continue
    
    content += `
      <section class="mb-8">
        <h2 class="text-xl font-semibold text-text-primary mb-4">${category.name}</h2>
        <div class="space-y-4">
          ${categoryItems.map(item => `
            <div class="flex gap-4 p-4 bg-surface rounded-lg border border-border">
              <div class="flex-shrink-0">
                ${item.imageUrl ? 
                  `<img src="${item.imageUrl}" alt="${item.name}" class="w-20 h-20 rounded-lg object-cover">` :
                  `<div class="w-20 h-20 rounded-lg bg-surface-muted flex items-center justify-center">
                    <svg class="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>`
                }
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-medium text-text-primary mb-1">${item.name}</h3>
                ${item.description ? `<p class="text-sm text-text-secondary mb-2">${item.description}</p>` : ''}
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-primary">₹${item.price}</span>
                  <span class="text-xs px-2 py-1 rounded-full ${item.foodType === 'veg' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${item.foodType === 'veg' ? '�� Veg' : '🔴 Non-Veg'}
                  </span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `
  }
  
  return content
}

// Run pre-rendering
preRender()
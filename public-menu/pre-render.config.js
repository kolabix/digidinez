import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load environment variables from .env file
dotenv.config()

// Function to fetch restaurant data
async function fetchRestaurantData(restaurantId) {
  try {
    const apiBase = process.env.VITE_API_URL
    const response = await fetch(`${apiBase}/menu/public/${restaurantId}`)
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.warn(`Failed to fetch data for restaurant ${restaurantId}:`, error)
    return null
  }
}

/**
 * Extract unique tags from menu items (same logic as frontend)
 */
function extractTagsFromItems(items) {
  const tagMap = new Map();
  
  items.forEach(item => {
    if (item.tagIds && Array.isArray(item.tagIds)) {
      item.tagIds.forEach(tag => {
        // Handle both 'id' and '_id' field names
        const tagId = tag.id || tag._id;
        if (tagId && tag.name) {
          tagMap.set(tagId, {
            id: tagId,
            name: tag.name,
            color: tag.color || '#6b7280'
          });
        }
      });
    }
  });
  
  return Array.from(tagMap.values());
}

// Function to fetch all restaurants (internal, secret-protected)
async function fetchAllRestaurants() {
  try {
    const apiBase = process.env.VITE_API_URL
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
    console.error('Failed to fetch restaurants:', error)
    return []
  }
}

// Main pre-rendering function
async function preRender() {
  console.log('Starting pre-rendering...')
  
  try {
    // Check if we're doing selective building
    const selectiveRestaurantId = process.env.RESTAURANT_ID;
    const isSelectiveBuild = process.env.SELECTIVE_BUILD === 'true';
    
    if (isSelectiveBuild && selectiveRestaurantId) {
      console.log(`🔄 Selective build for restaurant: ${selectiveRestaurantId}`);
      await preRenderSingleRestaurant(selectiveRestaurantId);
    } else {
      console.log('🔄 Building all restaurants');
      await preRenderAllRestaurants();
    }

    console.log('Pre-rendering completed successfully!')
  } catch (error) {
    console.error('Pre-rendering failed:', error)
    process.exit(1)
  }
}

// Function to pre-render a single restaurant
async function preRenderSingleRestaurant(restaurantId) {
  try {
    // Fetch single restaurant data
    const restaurant = await fetchRestaurantById(restaurantId);
    if (!restaurant) {
      throw new Error(`Restaurant ${restaurantId} not found`);
    }
    
    console.log(`Pre-rendering menu for ${restaurant.name} (${restaurantId})`);
    await preRenderRestaurant(restaurant);
    
  } catch (error) {
    console.error(`Failed to pre-render restaurant ${restaurantId}:`, error);
    throw error;
  }
}

// Function to pre-render all restaurants
async function preRenderAllRestaurants() {
  // Fetch all restaurants
  const restaurants = await fetchAllRestaurants()
  console.log(`Found ${restaurants.length} restaurants`)

  // Pre-render each restaurant's menu
  for (const restaurant of restaurants) {
    await preRenderRestaurant(restaurant);
  }
}

// Function to pre-render a single restaurant (extracted from main logic)
async function preRenderRestaurant(restaurant) {
  const restaurantId = restaurant.id
  console.log(`Pre-rendering menu for ${restaurant.name} (${restaurantId})`)

  // Ensure dist directory exists
  const distDir = path.resolve(__dirname, './dist')
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true })
  }

  // Read the built client template (contains hashed assets)
  const templatePath = path.join(distDir, 'index.html')
  if (!fs.existsSync(templatePath)) {
    throw new Error('Built template dist/index.html not found. Run "npm run build" first.')
  }
  const baseTemplate = fs.readFileSync(templatePath, 'utf-8')

  // Fetch restaurant-specific data
  const menuData = await fetchRestaurantData(restaurantId)
  if (!menuData) {
    console.warn(`Skipping ${restaurant.name} - no data available`)
    return
  }

  // Create restaurant-specific directory
  const restaurantDir = path.join(distDir, restaurantId)
  fs.mkdirSync(restaurantDir, { recursive: true })

  // Generate app HTML to inject into #root and a preload script
  const appHtml = generateAppHtml(restaurant, menuData)
  
  // Extract tags from menu items if not provided by API
  const extractedTags = menuData.tags && menuData.tags.length > 0 
    ? menuData.tags 
    : extractTagsFromItems(menuData.menuItems || []);
  
  const preloadScript = `\n<script>window.__PRELOADED_MENU__ = ${JSON.stringify({
    restaurant: menuData.restaurant,
    categories: menuData.categories,
    menuItems: menuData.menuItems,
    tags: extractedTags
  })};<\/script>`

  // Inject into template: title, root content, and preloaded data
  let finalHtml = baseTemplate
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(
      `${restaurant.name} | Digital Menu`
    )}</title>`) 
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>${preloadScript}`)

  // Add PWA favicon and manifest links
  const pwaLinks = generatePWALinks(restaurant.id, restaurant.primaryLogoUrl, restaurant.brandMarkUrl)
  finalHtml = finalHtml.replace('</head>', `    ${pwaLinks}\n  </head>`)

  // Generate manifest file
  generateManifest(restaurant, restaurant.primaryLogoUrl, restaurant.brandMarkUrl)

  // Write HTML file
  const htmlPath = path.join(restaurantDir, 'index.html')
  fs.writeFileSync(htmlPath, finalHtml)

  console.log(`✓ Generated ${htmlPath}`)
}

// Function to fetch a single restaurant by ID
async function fetchRestaurantById(restaurantId) {
  try {
    const apiBase = process.env.VITE_API_URL
    const secret = process.env.SSG_BUILD_SECRET
    const response = await fetch(`${apiBase}/restaurants/ssg/list`, {
      headers: {
        'x-ssg-secret': secret || ''
      }
    })
    const data = await response.json()
    const restaurants = data?.data?.restaurants || []
    return restaurants.find(r => r.id === restaurantId) || null
  } catch (error) {
    console.error('Failed to fetch restaurant:', error)
    return null
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
  // Determine which logo to show and whether to show the name
  const shouldHideName = restaurant.hideRestaurantNameInHeader === true && restaurant.primaryLogoUrl;
  const logoUrl = restaurant.primaryLogoUrl || restaurant.brandMarkUrl;
  const showName = !shouldHideName;

  return `
    <div class="min-h-screen bg-surface pb-20">
      <header class="sticky top-0 z-40 bg-surface border-b border-border shadow-sm">
        <div class="px-4 py-3">
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0">
              ${logoUrl ? 
                `<img src="${logoUrl}" alt="${restaurant.name} logo" class="rounded-lg object-contain ${
                  restaurant.primaryLogoUrl ? 'w-24 h-16' : 'w-16 h-16'
                }">` :
                `<div class="w-16 h-16 rounded-lg bg-primary flex items-center justify-center"></div>`
              }
            </div>
            ${showName ? `
            <div class="flex-1 min-w-0">
              <h1 class="font-semibold text-lg text-text-primary truncate">${escapeHtml(restaurant.name)}</h1>
              <p class="text-sm text-text-secondary">Digital Menu</p>
            </div>
            ` : ''}
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
                    ${item.foodType === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
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

// Function to generate PWA favicon and manifest links
function generatePWALinks(restaurantId, primaryLogoUrl, brandMarkUrl) {
  // Generate links for PWA icons and manifest
  let links = ''
  
  // Add manifest link
  links += `<link rel="manifest" href="/assets/manifest-${restaurantId}.webmanifest">\n    `
  
  // Add favicon links - brandMarkUrl is the primary source for favicons
  // Only fall back to primaryLogoUrl if brandMarkUrl doesn't exist
  const iconSourceUrl = brandMarkUrl || primaryLogoUrl;
  
  if (iconSourceUrl) {
    // Extract the base URL from the icon source URL (assuming it's from Vercel Blob)
    const iconUrlObj = new URL(iconSourceUrl)
    const baseBlobUrl = `${iconUrlObj.protocol}//${iconUrlObj.host}`
    
    // Add favicon links pointing to Vercel Blob
    links += `<link rel="icon" type="image/png" sizes="16x16" href="${baseBlobUrl}/restaurants/${restaurantId}/icons/favicon-16x16.png">\n    `
    links += `<link rel="icon" type="image/png" sizes="32x32" href="${baseBlobUrl}/restaurants/${restaurantId}/icons/favicon-32x32.png">\n    `
    links += `<link rel="apple-touch-icon" sizes="180x180" href="${baseBlobUrl}/restaurants/${restaurantId}/icons/apple-touch-icon.png">\n    `
    links += `<link rel="icon" type="image/png" sizes="192x192" href="${baseBlobUrl}/restaurants/${restaurantId}/icons/android-chrome-192x192.png">\n    `
    links += `<link rel="icon" type="image/png" sizes="512x512" href="${baseBlobUrl}/restaurants/${restaurantId}/icons/android-chrome-512x512.png">\n    `
    links += `<link rel="icon" href="${baseBlobUrl}/restaurants/${restaurantId}/icons/favicon.ico">`
  } else {
    // Fallback to local assets
    links += `<link rel="icon" type="image/png" sizes="16x16" href="/assets/icons/favicon-16x16.png">\n    `
    links += `<link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32x32.png">\n    `
    links += `<link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/apple-touch-icon.png">\n    `
    links += `<link rel="icon" type="image/png" sizes="192x192" href="/assets/icons/android-chrome-192x192.png">\n    `
    links += `<link rel="icon" type="image/png" sizes="512x512" href="/assets/icons/android-chrome-512x512.png">\n    `
    links += `<link rel="icon" href="/assets/icons/favicon.ico">`
  }
  
  return links
}

// Function to generate manifest file
function generateManifest(restaurant, primaryLogoUrl, brandMarkUrl) {
  const manifest = {
    name: restaurant.name,
    short_name: restaurant.name.length > 12 ? restaurant.name.substring(0, 12) : restaurant.name,
    description: `Digital menu for ${restaurant.name}`,
    start_url: `/${restaurant.id}/`,
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#ffffff',
    background_color: '#ffffff',
    icons: []
  };

  // brandMarkUrl is the primary source for favicons
  // Only fall back to primaryLogoUrl if brandMarkUrl doesn't exist
  const iconSourceUrl = brandMarkUrl || primaryLogoUrl;

  if (iconSourceUrl) {
    const iconUrlObj = new URL(iconSourceUrl);
    const baseBlobUrl = `${iconUrlObj.protocol}//${iconUrlObj.host}`;
    
    // Add icons pointing to Vercel Blob
    manifest.icons = [
      {
        src: `${baseBlobUrl}/restaurants/${restaurant.id}/icons/favicon-16x16.png`,
        sizes: '16x16',
        type: 'image/png'
      },
      {
        src: `${baseBlobUrl}/restaurants/${restaurant.id}/icons/favicon-32x32.png`,
        sizes: '32x32',
        type: 'image/png'
      },
      {
        src: `${baseBlobUrl}/restaurants/${restaurant.id}/icons/apple-touch-icon.png`,
        sizes: '180x180',
        type: 'image/png'
      },
      {
        src: `${baseBlobUrl}/restaurants/${restaurant.id}/icons/android-chrome-192x192.png`,
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: `${baseBlobUrl}/restaurants/${restaurant.id}/icons/android-chrome-512x512.png`,
        sizes: '512x512',
        type: 'image/png'
      }
    ];
  } else {
    // Fallback to local assets
    manifest.icons = [
      {
        src: '/assets/icons/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png'
      },
      {
        src: '/assets/icons/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png'
      },
      {
        src: '/assets/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png'
      },
      {
        src: '/assets/icons/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/assets/icons/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ];
  }

  // Ensure dist/assets directory exists
  const assetsDir = path.join(__dirname, 'dist', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const manifestPath = path.join(assetsDir, `manifest-${restaurant.id}.webmanifest`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`✓ Generated manifest for ${restaurant.name}`);
}

// Run pre-rendering
preRender()
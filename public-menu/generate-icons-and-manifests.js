#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fetch from 'node-fetch';
import { put } from '@vercel/blob';
import pwaAssetGenerator from 'pwa-asset-generator';
import dotenv from 'dotenv';
import os from 'os';

// Destructure the generateImages function
const { generateImages } = pwaAssetGenerator;

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const API_BASE_URL = process.env.API_BASE_URL;
const SSG_BUILD_SECRET = process.env.SSG_BUILD_SECRET;
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const VITE_BASE = process.env.VITE_BASE || '/menu/';

if (!API_BASE_URL || !SSG_BUILD_SECRET || !BLOB_READ_WRITE_TOKEN) {
  console.error('Missing required environment variables:');
  console.error('- API_BASE_URL:', API_BASE_URL ? '✓' : '✗');
  console.error('- SSG_BUILD_SECRET:', SSG_BUILD_SECRET ? '✓' : '✗');
  console.error('- BLOB_READ_WRITE_TOKEN:', BLOB_READ_WRITE_TOKEN ? '✓' : '✗');
  process.exit(1);
}

// Create temp directory
const tempDir = path.join(os.tmpdir(), 'digidinez-icons-' + Date.now());
const distDir = path.join(__dirname, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Ensure dist/assets directory exists
const assetsDir = path.join(distDir, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function logSuccess(message) {
  const timestamp = new Date().toISOString();
  console.log(`✅ [${timestamp}] ${message}`);
}

async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = baseDelay * Math.pow(2, attempt - 1);
      log(`Attempt ${attempt} failed, retrying in ${delay}ms...`, 'warn');
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function fetchRestaurants() {
  log('Fetching restaurant list...');
  
  const response = await retryWithBackoff(async () => {
    const res = await fetch(`${API_BASE_URL}/restaurants/ssg/list`, {
      headers: {
        'x-ssg-secret': SSG_BUILD_SECRET
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    return res;
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`API error: ${data.message}`);
  }
  
  const restaurants = data.data.restaurants || [];
  logSuccess(`Found ${restaurants.length} restaurants`);
  return restaurants;
}

async function downloadLogo(logoUrl, restaurantId) {
  if (!logoUrl) {
    log(`No logo URL for restaurant ${restaurantId}`, 'warn');
    return null;
  }
  
  try {
    log(`Downloading logo for restaurant ${restaurantId}...`);
    
    const response = await retryWithBackoff(async () => {
      const res = await fetch(logoUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res;
    });
    
    const buffer = await response.arrayBuffer();
    const tempPath = path.join(tempDir, `${restaurantId}-logo`);
    
    // Determine file extension from content type or URL
    let extension = 'png';
    const contentType = response.headers.get('content-type');
    if (contentType) {
      if (contentType.includes('jpeg') || contentType.includes('jpg')) extension = 'jpg';
      else if (contentType.includes('svg')) extension = 'svg';
      else if (contentType.includes('png')) extension = 'png';
    } else if (logoUrl.includes('.')) {
      extension = logoUrl.split('.').pop().split('?')[0];
    }
    
    const finalPath = `${tempPath}.${extension}`;
    fs.writeFileSync(finalPath, Buffer.from(buffer));
    
    logSuccess(`Logo downloaded for restaurant ${restaurantId}`);
    return finalPath;
  } catch (error) {
    log(`Failed to download logo for restaurant ${restaurantId}: ${error.message}`, 'warn');
    return null;
  }
}

async function generateIcons(logoPath, restaurantId) {
  if (!logoPath) {
    log(`Skipping icon generation for restaurant ${restaurantId} - no logo`, 'warn');
    return null;
  }
  
  try {
    log(`Generating icons for restaurant ${restaurantId}...`);
    
    const outputDir = path.join(tempDir, `icons-${restaurantId}`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate PWA assets
    const result = await generateImages(logoPath, outputDir, {
      type: 'png',
      quality: 90,
      iconOnly: true,
      mstile: false,
      pathOverride: '/',
      manifest: false,
      html: false,
      log: false
    });
    
    logSuccess(`Icons generated for restaurant ${restaurantId}`);
    return outputDir;
  } catch (error) {
    log(`Failed to generate icons for restaurant ${restaurantId}: ${error.message}`, 'error');
    return null;
  }
}

async function uploadToBlob(iconsDir, restaurantId) {
  if (!iconsDir) {
    log(`Skipping Blob upload for restaurant ${restaurantId} - no icons`, 'warn');
    return null;
  }
  
  try {
    log(`Uploading icons to Blob for restaurant ${restaurantId}...`);
    
    const iconFiles = fs.readdirSync(iconsDir);
    const uploadResults = {};
    
    for (const filename of iconFiles) {
      const filePath = path.join(iconsDir, filename);
      const fileBuffer = fs.readFileSync(filePath);
      
      // Determine content type
      let contentType = 'image/png';
      if (filename.endsWith('.ico')) contentType = 'image/x-icon';
      else if (filename.endsWith('.svg')) contentType = 'image/svg+xml';
      else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) contentType = 'image/jpeg';
      
      const blobKey = `restaurants/${restaurantId}/icons/${filename}`;
      
      const { url } = await retryWithBackoff(async () => {
        return await put(blobKey, fileBuffer, {
          access: 'public',
          addRandomSuffix: false,
          contentType
        });
      });
      
      uploadResults[filename] = url;
      log(`Uploaded ${filename} to Blob`);
    }
    
    logSuccess(`All icons uploaded to Blob for restaurant ${restaurantId}`);
    return uploadResults;
  } catch (error) {
    log(`Failed to upload icons to Blob for restaurant ${restaurantId}: ${error.message}`, 'error');
    return null;
  }
}

function generateManifest(restaurant, iconUrls) {
  const manifest = {
    name: restaurant.name,
    short_name: restaurant.name.length > 12 ? restaurant.name.substring(0, 12) : restaurant.name,
    description: `Digital menu for ${restaurant.name}`,
    start_url: `${VITE_BASE}${restaurant.id}/`,
    scope: VITE_BASE,
    display: 'standalone',
    orientation: 'portrait',
    theme_color: restaurant.brandColor || '#ffffff',
    background_color: restaurant.brandColor || '#ffffff',
    icons: []
  };
  
  // Add icons if available
  if (iconUrls) {
    // Handle the actual filenames generated by pwa-asset-generator
    if (iconUrls['apple-icon-180.png']) {
      manifest.icons.push({
        src: iconUrls['apple-icon-180.png'],
        sizes: '180x180',
        type: 'image/png'
      });
    }
    
    if (iconUrls['manifest-icon-192.maskable.png']) {
      manifest.icons.push({
        src: iconUrls['manifest-icon-192.maskable.png'],
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      });
    }
    
    if (iconUrls['manifest-icon-512.maskable.png']) {
      manifest.icons.push({
        src: iconUrls['manifest-icon-512.maskable.png'],
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      });
    }
    
    // Also add non-maskable versions if they exist
    if (iconUrls['manifest-icon-192.png']) {
      manifest.icons.push({
        src: iconUrls['manifest-icon-192.png'],
        sizes: '192x192',
        type: 'image/png'
      });
    }
    
    if (iconUrls['manifest-icon-512.png']) {
      manifest.icons.push({
        src: iconUrls['manifest-icon-512.png'],
        sizes: '512x512',
        type: 'image/png'
      });
    }
  }
  
  return manifest;
}

function writeManifest(manifest, restaurantId) {
  const manifestPath = path.join(assetsDir, `manifest-${restaurantId}.webmanifest`);
  const manifestContent = JSON.stringify(manifest, null, 2);
  
  fs.writeFileSync(manifestPath, manifestContent);
  logSuccess(`Manifest written for restaurant ${restaurantId}`);
  return manifestPath;
}

function patchHTML(restaurantId, iconUrls, manifestPath) {
  const htmlPath = path.join(distDir, 'menu', restaurantId, 'index.html');
  
  if (!fs.existsSync(htmlPath)) {
    log(`HTML file not found for restaurant ${restaurantId}, skipping patch`, 'warn');
    return;
  }
  
  try {
    log(`Patching HTML for restaurant ${restaurantId}...`);
    
    let html = fs.readFileSync(htmlPath, 'utf-8');
    
    // Generate favicon tags
    const faviconTags = [];
    
    if (iconUrls) {
      // Use the actual filenames generated by pwa-asset-generator
      if (iconUrls['apple-icon-180.png']) {
        faviconTags.push(`<link rel="apple-touch-icon" sizes="180x180" href="${iconUrls['apple-icon-180.png']}">`);
      }
      
      if (iconUrls['manifest-icon-192.maskable.png']) {
        faviconTags.push(`<link rel="icon" type="image/png" sizes="192x192" href="${iconUrls['manifest-icon-192.maskable.png']}">`);
      }
      
      if (iconUrls['manifest-icon-512.maskable.png']) {
        faviconTags.push(`<link rel="icon" type="image/png" sizes="512x512" href="${iconUrls['manifest-icon-512.maskable.png']}">`);
      }
      
      // Add non-maskable versions if they exist
      if (iconUrls['manifest-icon-192.png']) {
        faviconTags.push(`<link rel="icon" type="image/png" sizes="192x192" href="${iconUrls['manifest-icon-192.png']}">`);
      }
      
      if (iconUrls['manifest-icon-512.png']) {
        faviconTags.push(`<link rel="icon" type="image/png" sizes="512x512" href="${iconUrls['manifest-icon-512.png']}">`);
      }
    }
    
    // Add manifest link
    faviconTags.push(`<link rel="manifest" href="${VITE_BASE}assets/manifest-${restaurantId}.webmanifest">`);
    
    const faviconBlock = `<!--__FAVICONS_START__-->\n    ${faviconTags.join('\n    ')}\n    <!--__FAVICONS_END__-->`;
    
    // Check if favicon block already exists
    if (html.includes('<!--__FAVICONS_START__-->')) {
      // Replace existing block
      const regex = /<!--__FAVICONS_START__-->[\s\S]*?<!--__FAVICONS_END__-->/;
      html = html.replace(regex, faviconBlock);
    } else {
      // Insert before </head>
      html = html.replace('</head>', `    ${faviconBlock}\n  </head>`);
    }
    
    fs.writeFileSync(htmlPath, html);
    logSuccess(`HTML patched for restaurant ${restaurantId}`);
  } catch (error) {
    log(`Failed to patch HTML for restaurant ${restaurantId}: ${error.message}`, 'error');
  }
}

function cleanup() {
  try {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      log('Temporary files cleaned up');
    }
  } catch (error) {
    log(`Cleanup failed: ${error.message}`, 'warn');
  }
}

// Main execution
async function main() {
  let successCount = 0;
  let totalCount = 0;
  
  try {
    log('Starting PWA icon and manifest generation...');
    
    // Create temp directory
    fs.mkdirSync(tempDir, { recursive: true });
    
    // Fetch restaurants
    const restaurants = await fetchRestaurants();
    totalCount = restaurants.length;
    
    if (totalCount === 0) {
      log('No restaurants found, exiting', 'warn');
      return;
    }
    
    // Process each restaurant
    for (const restaurant of restaurants) {
      try {
        log(`Processing restaurant: ${restaurant.name} (${restaurant.id})`);
        
        // Download logo
        const logoPath = await downloadLogo(restaurant.logoUrl, restaurant.id);
        
        // Generate icons
        const iconsDir = await generateIcons(logoPath, restaurant.id);
        
        // Upload to Blob
        const iconUrls = await uploadToBlob(iconsDir, restaurant.id);
        
        // Generate manifest
        const manifest = generateManifest(restaurant, iconUrls);
        writeManifest(manifest, restaurant.id);
        
        // Patch HTML (if it exists)
        patchHTML(restaurant.id, iconUrls, `manifest-${restaurant.id}.webmanifest`);
        
        successCount++;
        logSuccess(`Completed processing for ${restaurant.name}`);
        
      } catch (error) {
        log(`Failed to process restaurant ${restaurant.id}: ${error.message}`, 'error');
        // Continue with next restaurant
      }
    }
    
    // Summary
    log(`\n🎉 Generation completed!`);
    log(`Successfully processed: ${successCount}/${totalCount} restaurants`);
    
    if (successCount === 0) {
      log('No restaurants were processed successfully', 'error');
      process.exit(1);
    }
    
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
    process.exit(1);
  } finally {
    cleanup();
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('Process interrupted, cleaning up...', 'warn');
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Process terminated, cleaning up...', 'warn');
  cleanup();
  process.exit(0);
});

// Run main function
main().catch(error => {
  log(`Unhandled error: ${error.message}`, 'error');
  cleanup();
  process.exit(1);
});

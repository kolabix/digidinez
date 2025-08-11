# Public Menu - PWA Icon Generation

This project automatically generates PWA icons and manifests for each restaurant at build time, creating a personalized experience for each restaurant's digital menu.

## Features

- **Automatic Icon Generation**: Creates PWA icons from restaurant logos using `pwa-asset-generator`
- **Vercel Blob Storage**: Uploads generated icons to Vercel Blob for global CDN distribution
- **Per-Restaurant Manifests**: Generates custom web app manifests for each restaurant
- **HTML Patching**: Automatically inserts favicon and manifest links into pre-rendered HTML
- **Brand Color Support**: Uses restaurant brand colors for theme and background colors

## Build Process

The build process follows this sequence:

1. **Vite Build** (`npm run build`): Builds the React application
2. **SSG Pre-rendering** (`npm run build:ssg`): Generates static HTML for each restaurant
3. **Icon Generation** (`npm run build:icons`): Creates icons, uploads to Blob, and patches HTML

## Environment Variables

Create a `.env` file in the project root with:

```bash
VITE_BASE=/menu/
API_BASE_URL=http://localhost:3001
SSG_BUILD_SECRET=your_secret_here
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### Required Variables

- `API_BASE_URL`: Base URL of the DigiDinez API
- `SSG_BUILD_SECRET`: Secret key for authenticating with the API during build
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob storage token for uploading icons
- `VITE_BASE`: Base path for the application (defaults to `/menu/`)

## Generated Assets

### Icons

For each restaurant, the following icons are generated and uploaded to Vercel Blob:

- `icon-16x16.png` - 16x16 favicon
- `icon-32x32.png` - 32x32 favicon  
- `icon-180x180.png` - Apple touch icon
- `icon-192x192.png` - PWA icon (192x192)
- `icon-512x512.png` - PWA icon (512x512)
- `favicon.ico` - Traditional favicon

**Storage Location**: `restaurants/{restaurant_id}/icons/{filename}`

### Manifests

Each restaurant gets a custom web app manifest:

**File**: `dist/assets/manifest-{restaurant_id}.webmanifest`
**URL**: `/menu/assets/manifest-{restaurant_id}.webmanifest`

**Features**:
- Restaurant name and description
- Custom start URL and scope
- Brand color theming
- Icon references pointing to Blob URLs

### HTML Patching

The script automatically patches each restaurant's HTML file to include:

```html
<!--__FAVICONS_START__-->
<link rel="icon" type="image/png" sizes="16x16" href="https://blob.vercel-storage.com/...">
<link rel="icon" type="image/png" sizes="32x32" href="https://blob.vercel-storage.com/...">
<link rel="apple-touch-icon" sizes="180x180" href="https://blob.vercel-storage.com/...">
<link rel="icon" href="https://blob.vercel-storage.com/...">
<link rel="manifest" href="/menu/assets/manifest-{restaurant_id}.webmanifest">
<!--__FAVICONS_END__-->
```

## API Requirements

The system requires these API endpoints:

### 1. Restaurant List (SSG)
```
GET /api/restaurants/ssg/list
Headers: x-ssg-secret: {secret}
Response: { success: true, data: { restaurants: [{ id, name, logoUrl, brandColor }] } }
```

### 2. Restaurant Profile (Public)
```
GET /api/menu/public/{restaurantId}
Response: { success: true, data: { restaurant: { id, name, logoUrl, brandColor, ... } } }
```

## Error Handling

The script is designed to be resilient:

- **Missing Logos**: Skips icon generation but still creates manifest
- **API Failures**: Continues processing other restaurants
- **Upload Failures**: Logs errors and continues
- **HTML Missing**: Skips HTML patching with warning

## Performance Considerations

- **Sequential Processing**: Restaurants are processed one at a time to avoid rate limiting
- **Retry Logic**: Exponential backoff for API calls and Blob uploads
- **Memory Management**: Temporary files are cleaned up after processing
- **Idempotent**: Safe to run multiple times

## Deployment

### Vercel

The project is configured for Vercel deployment:

- **Build Command**: `npm run build:prod`
- **Output Directory**: `dist`
- **Headers**: Caching rules for manifests and HTML files

### Manual Deployment

```bash
# Install dependencies
npm install

# Build and generate icons
npm run build:prod

# Deploy dist/ directory
```

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Ensure all required `.env` variables are set
   - Check API_BASE_URL is accessible from build environment

2. **Blob Upload Failures**
   - Verify BLOB_READ_WRITE_TOKEN is valid
   - Check Vercel Blob storage limits

3. **Icon Generation Failures**
   - Ensure restaurant logos are accessible URLs
   - Check logo file formats (PNG, JPG, SVG supported)

4. **HTML Patching Issues**
   - Verify dist/menu/{restaurant_id}/index.html exists
   - Check file permissions

### Debug Mode

Run the icon generation separately to debug:

```bash
npm run build:icons
```

This will show detailed logs for each step of the process.

## Development

### Adding New Icon Sizes

To add new icon sizes, modify the `generateManifest` function in `generate-icons-and-manifests.js`:

```javascript
if (iconUrls['icon-{size}x{size}.png']) {
  manifest.icons.push({
    src: iconUrls['icon-{size}x{size}.png'],
    sizes: '{size}x{size}',
    type: 'image/png'
  });
}
```

### Customizing Manifest

Edit the `generateManifest` function to add custom PWA features:

```javascript
const manifest = {
  // ... existing properties
  categories: ['food', 'restaurant'],
  lang: 'en',
  dir: 'ltr',
  // ... custom properties
};
```

## License

This project is part of DigiDinez and follows the same licensing terms.

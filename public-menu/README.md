# DigiDinez Public Menu App

Public-facing digital menu application that customers access by scanning QR codes.

## Features

- Responsive digital menu display
- Category-based menu organization
- Filtering by dietary preferences and tags
- Search functionality
- **Dual-logo system** for flexible branding

## Dual-Logo System

The public menu app implements intelligent logo display based on restaurant branding preferences:

### Header Rendering Logic

- **Logo + Name**: Default behavior showing both logo and restaurant name
- **Logo Only**: When `hideRestaurantNameInHeader` is true and `primaryLogoUrl` exists
- **Logo Selection**: Prefers `brandMarkUrl` (square) over `primaryLogoUrl` (any ratio)

### Favicon Generation

- **Primary Source**: Always uses `brandMarkUrl` for browser icons and PWA assets
- **Fallback**: Falls back to `primaryLogoUrl` if brand mark is unavailable
- **Storage**: Icons generated and stored in Vercel Blob under `restaurants/{id}/icons/`

### Usage Examples

1. **Full Logo with Name**: `primaryLogoUrl` + `hideRestaurantNameInHeader = false`
2. **Logo Only**: `primaryLogoUrl` + `hideRestaurantNameInHeader = true`
3. **Symbol + Name**: `brandMarkUrl` + `hideRestaurantNameInHeader = false`

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables (see `env.example`)
3. Start development server: `npm run dev`
4. Build for production: `npm run build:prod`

## Development

- Built with React 18 + Vite
- Uses Tailwind CSS for styling
- SSG pre-rendering for performance
- API integration with restaurant data
- Responsive design for all devices

# DigiDinez

A full-stack web application for Indian restaurants to digitize their menus via QR codes.

## Project Structure

- **`api/`** - Backend API (Node.js + Express + MongoDB)
- **`admin/`** - Admin application (React + Vite + Tailwind CSS)
- **`public-menu/`** - Public menu application (React + Vite + Tailwind CSS)

## Dual-Logo System

The application now supports a dual-logo system for enhanced branding flexibility:

### Logo Fields

- **`primaryLogoUrl`** - Main restaurant logo (any aspect ratio, may include wordmark/name)
- **`brandMarkUrl`** - Square logo (1:1 ratio) for browser icons and compact placements
- **`hideRestaurantNameInHeader`** - Boolean to control restaurant name display in public header

### Behavior

- **Public Header**: If `hideRestaurantNameInHeader` is true and `primaryLogoUrl` exists, only the logo is shown. Otherwise, logo + restaurant name are displayed.
- **Favicon Generation**: Always uses `brandMarkUrl` as the source for browser icons and PWA assets.
- **Storage**: All logo uploads are stored in Vercel Blob under `restaurants/{restaurantId}/branding/`.

### Usage

1. **Full Logo with Name**: Set `primaryLogoUrl`, set `hideRestaurantNameInHeader = true`, optional `brandMarkUrl`
2. **Symbol + Separate Name**: Set `brandMarkUrl`, leave `hideRestaurantNameInHeader = false`

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Vercel account (for Blob storage)

### Installation

1. Clone the repository
2. Install dependencies in each directory:
   ```bash
   cd api && npm install
   cd ../admin && npm install
   cd ../public-menu && npm install
   ```

3. Set up environment variables (see `env.example` files)

4. Start the backend:
   ```bash
   cd api && npm run dev
   ```

5. Start the admin app:
   ```bash
   cd admin && npm run dev
   ```

6. Start the public menu app:
   ```bash
   cd public-menu && npm run dev
   ```

## Build Commands

- **Production Build**: `npm run build:prod`
- **Full Build**: `npm run build:full`

## API Endpoints

All API routes are prefixed with `/api` and follow the nested response structure:

```json
{
  "success": true,
  "data": {
    "entity": { ... }
  }
}
```

## Authentication

- JWT tokens stored in HTTP-only cookies
- Restaurant authentication uses `req.restaurant.id` (not `_id`)
- All routes require authentication except public endpoints

## Contributing

1. Follow the established code patterns
2. Use custom components instead of native HTML elements
3. Implement proper form validation with the `useForm` hook
4. Ensure all API responses follow the nested structure
5. Test thoroughly before submitting changes

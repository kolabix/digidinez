# DigiDinez Admin App

Admin application for restaurant owners to manage their digital menus and branding.

## Features

- Restaurant profile management
- Menu item CRUD operations
- Category and tag management
- QR code generation
- **Dual-logo system** for enhanced branding

## Dual-Logo System

The admin app now supports a comprehensive dual-logo system:

### Logo Management

- **Primary Logo**: Upload your main restaurant logo (any aspect ratio, may include wordmark/name)
- **Brand Mark**: Upload a square (1:1) version for browser icons and compact placements
- **Header Display Control**: Toggle whether to hide the restaurant name in the public menu header

### Usage

1. **Full Logo with Name**: Upload primary logo, enable "Hide Restaurant Name" checkbox
2. **Symbol + Separate Name**: Upload brand mark, leave name visible


### Storage

All logo uploads are stored in Vercel Blob under `restaurants/{restaurantId}/branding/` for organized asset management.

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables (see `env.example`)
3. Start development server: `npm run dev`
4. Build for production: `npm run build:prod`

## Development

- Built with React 18 + Vite
- Uses Tailwind CSS for styling
- Custom component library (Button, Input, Toast, etc.)
- Form handling with `useForm` hook
- API integration with restaurant service

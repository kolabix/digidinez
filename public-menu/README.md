# DigiDinez Public Menu

A production-ready React 19 + Vite app for displaying restaurant menus with advanced filtering, search, and category navigation.

## Features

- **Sticky Header**: Restaurant name and logo display
- **Advanced Filtering**: Tri-state veg/non-veg toggle and multi-select tag filters
- **Category Navigation**: Collapsible sections with smooth scrolling
- **Debounced Search**: Type-ahead search with dropdown results
- **Bottom Sheet**: Category navigation with framer-motion animations
- **Image Optimization**: Cloudinary blur placeholders and skeleton loading
- **URL State Sync**: All filters and search persist in URL parameters
- **Mobile-First**: Responsive design optimized for mobile devices
- **Accessibility**: Basic a11y support with proper ARIA labels

## Tech Stack

- **React 19** with JSX
- **Vite** for fast development and building
- **Tailwind CSS v4** with custom theme tokens
- **Framer Motion** for animations
- **Lucide React** for icons
- **CLSX** for conditional class names

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy the example environment file and update it:
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Backend API base URL
   VITE_API_BASE_URL=http://localhost:3001
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Access the app**:
   - With restaurant ID in URL: `http://localhost:5173/public/menu/687c8d99d8e6993f3609d564`
   - With environment restaurant ID: `http://localhost:5173/public/menu/any-restaurant-id`

## API Integration

The app uses the unified backend API:

### Public Menu Endpoint
- Endpoint: `GET /api/menu/public/:restaurantId`
- Returns: `{ success: true, data: { restaurant, categories, items, tags } }`
- No authentication required
- Restaurant ID can be obtained from the backend profile API

## URL Parameters

The app syncs state to URL query parameters:
- `veg=true` - Show only vegetarian items
- `nonveg=true` - Show only non-vegetarian items
- `tags=tag1,tag2` - Filter by tag IDs
- `q=search` - Search term
- `category=id` - Scroll target category

## Image Handling

- **Cloudinary**: Automatically generates blur placeholders
- **Other URLs**: Shows skeleton loading until image loads
- **Missing images**: Maintains fixed aspect ratio with skeleton

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## Customization

### Theme Colors
Edit `src/index.css` to modify the `@theme` block:
```css
@theme {
  --color-primary: #0ea5e9;
  --color-accent: #22c55e;
  --color-danger: #ef4444;
  /* ... */
}
```

### Component Styling
All components use Tailwind classes and can be customized by modifying the component files.

## Browser Support

- Modern browsers with ES2020+ support
- Mobile browsers (iOS Safari, Chrome Mobile)
- No IE11 support required

## Performance

- Lazy image loading
- Debounced search (250ms)
- Efficient filtering and rendering
- Minimal bundle size with tree-shaking

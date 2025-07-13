# Copilot Instructions for DigiDinez

## 🔧 Project Overview
DigiDinez is a full-stack web application that enables restaurants to digitize their menus via QR codes. Restaurant owners can log in, manage their digital menu, and generate a live QR code that customers can scan to view the menu on their phones — no app required.

## 🧱 Tech Stack

- **Frontend**: Two separate React (Vite) + Tailwind CSS apps *(Not built yet)*
  - **Admin Dashboard**: Restaurant management interface (desktop/tablet responsive)
  - **Public Menu**: Customer-facing menu display (mobile-first)
- **Backend**: Node.js + Express *(Complete)*
- **Database**: MongoDB Atlas (Cloud) - Mongoose ODM
- **QR Code Generation**: `qrcode` npm package
- **Authentication**: JWT-based with bcrypt password hashing
- **Image Uploads**: Local file system with multer (MVP)
- **Validation**: express-validator for input validation
- **Environment**: Local development (backend on port 3001)

## 📁 Folder Structure

<pre>
digidinez/
├── backend/                    # Express backend API (COMPLETE)
│   ├── controllers/            # Business logic for routes
│   │   ├── authController.js   # Authentication (register, login, logout, me)
│   │   ├── menuController.js   # Menu CRUD + image upload + public menu
│   │   ├── qrController.js     # QR code generation and management
│   │   └── restaurantController.js # Profile management + stats
│   ├── models/                 # Mongoose schemas
│   │   ├── Restaurant.js       # Restaurant model with auth methods
│   │   ├── MenuItem.js         # Menu item model with categories
│   │   └── index.js           # Model exports
│   ├── routes/                 # Express route definitions
│   │   ├── authRoutes.js      # Auth endpoints
│   │   ├── menuRoutes.js      # Menu CRUD + public menu endpoints
│   │   └── restaurantRoutes.js # Profile + QR code + stats endpoints
│   ├── middleware/             # Auth middleware, validation, uploads
│   │   ├── auth.js            # JWT token verification
│   │   ├── validation.js      # Input validation rules
│   │   └── uploadMiddleware.js # File upload error handling
│   ├── utils/                  # Utility functions
│   │   ├── qrGenerator.js     # QR code generation logic
│   │   ├── imageUpload.js     # Image upload configuration
│   │   └── validators.js      # Input sanitization
│   ├── config/                 # Configuration
│   │   └── database.js        # MongoDB connection
│   ├── uploads/               # Local file storage
│   │   └── menu-images/       # Menu item images
│   ├── qr-codes/              # Generated QR code images
│   └── server.js              # Express server entry point
│
├── admin/                      # Restaurant Admin Dashboard (NOT BUILT YET)
│   ├── public/
│   ├── src/
│   │   ├── assets/             # Images, logos, icons
│   │   ├── components/         # Reusable admin UI components
│   │   │   ├── common/         # Button, Input, Modal, etc.
│   │   │   ├── layout/         # Header, Sidebar, Footer
│   │   │   └── forms/          # LoginForm, MenuItemForm, etc.
│   │   ├── pages/              # Login, Dashboard, Menu Management, Profile
│   │   │   ├── auth/           # Login, Register pages
│   │   │   ├── dashboard/      # Dashboard, Profile, Stats
│   │   │   └── menu/           # Menu management pages
│   │   ├── services/           # Axios API calls for admin
│   │   ├── hooks/              # Admin-specific React hooks
│   │   ├── context/            # AuthContext, global state
│   │   ├── utils/              # Admin helper functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── menu/                       # Public Menu Viewer (NOT BUILT YET)
│   ├── public/
│   ├── src/
│   │   ├── assets/             # Menu-specific images, icons
│   │   ├── components/         # Customer-facing UI components
│   │   │   ├── menu/           # MenuCard, CategoryFilter, ItemDetails
│   │   │   └── layout/         # Header, Footer for menu app
│   │   ├── pages/              # Public menu display, item details
│   │   ├── services/           # Public API calls (no auth)
│   │   ├── themes/             # Restaurant-specific themes and branding
│   │   ├── hooks/              # Menu-specific React hooks
│   │   ├── utils/              # Menu helper functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── shared/                     # Shared utilities between apps (OPTIONAL)
│   ├── api/                   # Common API configurations
│   ├── utils/                 # Shared helper functions
│   └── types/                 # TypeScript types (if needed)
│
├── README.md
└── .gitignore
</pre>

## ✅ Conventions

- Use **Express Router** and `async/await` in all backend routes.
- Use **Mongoose models** per entity (e.g., `Restaurant.js`, `MenuItem.js`).
- API routes are prefixed with `/api`, for example:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/menu/public/:restaurantId`
- All APIs return JSON responses with `success` boolean and `data` object.
- JWT tokens are sent/stored in **HTTP-only cookies**.
- Use `axios` for all frontend API calls.
- Tailwind CSS should be used for all UI styling.
- Authentication middleware uses `req.restaurant` (not `req.user`).

## 🚀 Backend API Status: COMPLETE

### 🔐 Authentication System
- ✅ Restaurant registration with email/phone uniqueness validation
- ✅ Login with email OR phone number support  
- ✅ JWT tokens in HTTP-only cookies (7-day expiration)
- ✅ bcrypt password hashing
- ✅ Protected route middleware

**Endpoints:**
```
POST /api/auth/register    # Register new restaurant
POST /api/auth/login       # Login (email or phone)
POST /api/auth/logout      # Logout and clear cookie
GET  /api/auth/me          # Get current user profile
```

### 🍽️ Menu Management System
- ✅ Complete CRUD operations for menu items
- ✅ 11 predefined categories (appetizers, main-course, desserts, etc.)
- ✅ Advanced features: tags, allergens, spicy level, prep time
- ✅ Availability toggle for items
- ✅ Image upload system with validation (JPEG, PNG, WebP, 5MB max)
- ✅ Public menu API for customer viewing (no auth required)

**Endpoints:**
```
GET    /api/menu/items                    # Get restaurant's menu items
POST   /api/menu/items                    # Create new menu item
GET    /api/menu/items/:id                # Get specific menu item
PUT    /api/menu/items/:id                # Update menu item
DELETE /api/menu/items/:id                # Delete menu item
PATCH  /api/menu/items/:id/availability   # Toggle availability
POST   /api/menu/items/:id/image          # Upload item image
GET    /api/menu/items/:id/image          # Get item image info
DELETE /api/menu/items/:id/image          # Delete item image
GET    /api/menu/public/:restaurantId     # Public menu (no auth)
```

### 🏢 Restaurant Profile Management
- ✅ View and update restaurant profile
- ✅ Email/phone uniqueness validation across database
- ✅ Address management (street, city, state, zip, country)
- ✅ Restaurant status toggle (active/inactive)
- ✅ Restaurant statistics and analytics

**Endpoints:**
```
GET   /api/restaurants/profile    # Get restaurant profile
PUT   /api/restaurants/profile    # Update profile (with uniqueness checks)
PATCH /api/restaurants/status     # Toggle active/inactive status
GET   /api/restaurants/stats      # Restaurant and menu statistics
```

### 📱 QR Code System
- ✅ Generate QR codes pointing to public menu URLs
- ✅ QR code file management (PNG format, 300x300px)
- ✅ Static file serving for QR codes
- ✅ Public QR code info endpoint

**Endpoints:**
```
POST   /api/restaurants/generate-qr    # Generate/regenerate QR code
GET    /api/restaurants/qr             # Get current QR code info
DELETE /api/restaurants/qr             # Delete QR code
GET    /api/restaurants/:id/qr         # Public QR code info (no auth)
```

### 📊 Database Models

**Restaurant Model:**
- name, email (unique), phone (unique), password (hashed)
- address (street, city, state, zipCode, country)
- isActive, qrCodeUrl, timestamps
- Authentication methods: comparePassword(), generateAuthToken()

**MenuItem Model:**
- name, description, price, category
- restaurantId (reference), image, isAvailable
- tags[], allergens[], spicyLevel, preparationTime
- Static methods: findByRestaurant(), getCategoriesByRestaurant()

## 📁 File Storage
- **Menu Images**: `/uploads/menu-images/` (local filesystem)
- **QR Codes**: `/qr-codes/` (local filesystem)
- **Static Serving**: Both accessible via Express static middleware

## 🔒 Security Features
- bcrypt password hashing (salt rounds: 12)
- JWT tokens with 7-day expiration
- HTTP-only cookies (secure in production)
- Input validation with express-validator
- File upload restrictions (type, size, destination)
- Email/phone uniqueness validation
- Protected routes with authentication middleware

## 💻 Common Local Commands

**⚠️ IMPORTANT TERMINAL NAVIGATION:**
- Always use full paths with `cd` in terminal commands
- Copilot terminal resets to root directory, so use: `cd /Users/sahilpurav/Code/digidinez/admin && npm run dev`
- Never assume you're in the correct directory - always include the full cd path

```bash
# Start backend (from project root)
cd /Users/sahilpurav/Code/digidinez/backend && npm install
cd /Users/sahilpurav/Code/digidinez/backend && npm run dev          # Runs on http://localhost:3001

# Start admin dashboard (when built)
cd /Users/sahilpurav/Code/digidinez/admin && npm install
cd /Users/sahilpurav/Code/digidinez/admin && npm run dev          # Will run on http://localhost:5173

# Start public menu app (when built)
cd /Users/sahilpurav/Code/digidinez/menu && npm install
cd /Users/sahilpurav/Code/digidinez/menu && npm run dev          # Will run on http://localhost:3002

# Setup Tailwind CSS for new app
cd /Users/sahilpurav/Code/digidinez/admin && npm install -D tailwindcss autoprefixer @tailwindcss/vite

# Test backend APIs
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "admin@pizzapalace.com", "password": "password123"}' \
  -c cookies.txt

curl -X GET http://localhost:3001/api/restaurants/profile -b cookies.txt
```

## 📦 Backend Dependencies (Installed)

- express@5.1.0
- mongoose@8.16.3  
- dotenv@17.2.0
- cors@2.8.5
- bcryptjs@2.4.3
- jsonwebtoken@9.0.2
- qrcode@1.5.4
- multer@2.0.1
- express-validator@7.2.1
- cookie-parser@1.4.7
- nodemon@3.1.10 (dev)

## 🎯 Frontend Requirements (When Building)

### Admin Dashboard
- React + Vite
- axios (for API calls)
- react-router-dom (routing)
- tailwindcss (styling)
- clsx (optional utility)
- Desktop/tablet responsive design

### Public Menu App
- React + Vite
- axios (for public API calls)
- react-router-dom (routing)
- tailwindcss (styling)
- Mobile-first responsive design
- Restaurant theming system

## 🏗️ Frontend Architecture Strategy

DigiDinez uses a **dual-frontend architecture** with two separate React applications:

### 🖥️ Admin Dashboard (`/admin`)
- **Purpose**: Restaurant management and operations
- **Users**: Restaurant owners, managers, staff
- **Device Target**: Desktop and tablet (responsive design)
- **Features**: Authentication, menu management, profile settings, QR codes, analytics
- **Deployment**: Single admin portal serving all restaurants
- **URL Structure**: `admin.digidinez.com` or `app.digidinez.com`

### 📱 Public Menu App (`/menu`)
- **Purpose**: Customer-facing menu display
- **Users**: Restaurant customers (diners)
- **Device Target**: Mobile-first (smartphones)
- **Features**: Menu browsing, item details, restaurant branding
- **Deployment**: Per-restaurant customizable themes
- **URL Structure**: 
  - Default: `menu.digidinez.com/:restaurantId`
  - Custom domains: `menu.pizzapalace.com` (future feature)

### 🎯 Benefits of Separation
- **Optimized UX**: Business tools vs customer experience
- **Independent scaling**: Admin (few users) vs Menu (many customers)
- **Custom branding**: Each restaurant can have unique themes
- **Flexible deployment**: Different hosting strategies per app
- **White-label potential**: Restaurant-specific domains and branding

## 🎨 Tailwind CSS Configuration (Vite)

### Working Setup for Both Admin and Menu Apps:

1. **Install Tailwind Dependencies:**
```bash
npm install -D tailwindcss autoprefixer @tailwindcss/vite
```

2. **Vite Configuration** (`vite.config.js`):
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

3. **⚠️ NO tailwind.config.js needed** - Tailwind CSS v4 removed traditional config files

4. **CSS Setup with Custom Colors** (`src/index.css`):
```css
@import 'tailwindcss';

@theme {
  --color-primary-50: oklch(0.971 0.013 164.54);
  --color-primary-100: oklch(0.936 0.032 163.22);
  --color-primary-200: oklch(0.885 0.062 162.47);
  --color-primary-300: oklch(0.807 0.108 161.61);
  --color-primary-400: oklch(0.707 0.162 160.77);
  --color-primary-500: oklch(0.618 0.201 160.29);
  --color-primary-600: oklch(0.524 0.201 159.75);
  --color-primary-700: oklch(0.449 0.182 159.72);
  --color-primary-800: oklch(0.380 0.156 159.91);
  --color-primary-900: oklch(0.324 0.135 160.53);
  --color-primary-950: oklch(0.192 0.084 161.35);
}

/* Custom component styles */
.btn-primary {
  background-color: #059669;
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #047857;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #111827;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}

.input-field {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
}

.input-field:focus {
  outline: none;
  border-color: #059669;
  box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.2);
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}
```

5. **Important Notes:**
- **NO PostCSS configuration needed** - @tailwindcss/vite handles everything
- **Use `@import 'tailwindcss';`** instead of separate base/components/utilities imports
- **Custom colors defined with `@theme` directive** using OKLCH color space
- **All Tailwind utilities work** out of the box (bg-primary-600, text-primary-700, etc.)
- **Custom classes** should be written in regular CSS (not @apply)

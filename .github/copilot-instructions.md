# Copilot Instructions for DigiDinez

## 🔧 Project Overview
DigiDinez is a full-stack web application that enables restaurants to digitize their menus via QR codes. Restaurant owners can log in, manage their digital menu, and generate a live QR code that customers can scan to view the menu on their phones — no app required.

## 🧱 Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS *(Not built yet)*
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
├── frontend/                   # React frontend (NOT BUILT YET)
│   ├── public/
│   └── src/
│       ├── assets/             # Images, logos, etc.
│       ├── components/         # Reusable UI components
│       ├── pages/              # Login, Dashboard, Public Menu View
│       ├── services/           # Axios API calls
│       ├── routes/             # React Router definitions
│       ├── App.jsx
│       └── main.jsx
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

```bash
# Start backend (from project root)
cd backend
npm install
npm run dev          # Runs on http://localhost:3001

# Start frontend (when built)
cd frontend
npm install
npm run dev          # Will run on http://localhost:3000

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

- React + Vite
- axios (for API calls)
- react-router-dom (routing)
- tailwindcss (styling)
- clsx (optional utility)

## 🧪 Backend Testing Examples

```bash
# Login and save cookies
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "admin@pizzapalace.com", "password": "password123"}' \
  -c cookies.txt

# Get menu items
curl -X GET http://localhost:3001/api/menu/items -b cookies.txt

# Generate QR code
curl -X POST http://localhost:3001/api/restaurants/generate-qr -b cookies.txt

# View public menu (no auth)
curl -X GET http://localhost:3001/api/menu/public/{restaurantId}

# Update restaurant profile
curl -X PUT http://localhost:3001/api/restaurants/profile \
  -H "Content-Type: application/json" \
  -d '{"name": "New Restaurant Name"}' \
  -b cookies.txt
```

---

✏️ **Keep this file updated** as new conventions, routes, models, or utilities are added. GitHub Copilot will use this to generate better and more consistent code suggestions.

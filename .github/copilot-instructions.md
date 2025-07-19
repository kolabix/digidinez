# Copilot Instructions for DigiDinez

## � Important Agent Guidelines
- **When asked for implementation plans**: Provide only file paths and purposes, NOT code examples
- **When asked to implement/code**: Provide actual code implementation
- **Be concise in planning**: Focus on file structure and objectives, detailed code comes during implementation

## �🔧 Project Overview
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

## 🏗️ Development Phases

### ✅ Phase 1: Backend API Development - COMPLETE
- ✅ Full backend infrastructure with Node.js + Express + MongoDB
- ✅ Authentication system with JWT cookies
- ✅ Menu management CRUD operations
- ✅ Restaurant profile management
- ✅ QR code generation system
- ✅ Image upload system
- ✅ 20+ API endpoints with comprehensive validation

### ✅ Phase 2: Admin Authentication Frontend - COMPLETE
- ✅ React + Vite + Tailwind CSS setup
- ✅ Authentication context and hooks
- ✅ Login/Register pages with validation
- ✅ Reusable UI components (Button, Input)
- ✅ API service layer with axios
- ✅ Protected routing system
- ✅ Responsive design foundation

### 🚧 Phase 3: Restaurant Profile Management - IN PROGRESS
**Current Priority - Sessions 1-2 COMPLETE ✅ | Session 3 NEXT 🎯**

**✅ COMPLETED - Session 1: Layout Foundation**
- ✅ Complete layout system (Layout, Sidebar, Header components)
- ✅ Navigation infrastructure with responsive design
- ✅ Protected routing with authentication flow
- ✅ Mobile menu functionality
- ✅ Professional UI with Tailwind CSS styling

**✅ COMPLETED - Session 2: Navigation Integration**
- ✅ Profile page routing and placeholder component
- ✅ Multi-page navigation (Dashboard ↔ Profile)
- ✅ Active state highlighting and breadcrumb navigation
- ✅ Future phase route placeholders (Menu, QR)
- ✅ Foundation established for profile development

**🎯 NEXT - Session 3: API Service Layer**

#### 🎯 Objectives
Build a comprehensive restaurant profile management system that allows restaurant owners to view, edit, and manage their restaurant information, address details, and operational status.

#### 📁 File Structure Status
```
admin/src/
├── pages/profile/
│   ├── Profile.jsx              # Main profile page with view/edit toggle
│   ├── ProfileForm.jsx          # Editable profile form component
│   └── AddressForm.jsx          # Address management subcomponent
├── services/
│   └── restaurantService.js     # API calls for restaurant operations
├── components/layout/           # ✅ COMPLETED - Session 1
│   ├── Sidebar.jsx             # ✅ Navigation sidebar with responsive design
│   ├── Header.jsx              # ✅ App header with user info and dropdown
│   └── Layout.jsx              # ✅ Main layout wrapper with mobile support
└── hooks/
    └── useRestaurant.js        # Custom hook for restaurant operations
```

#### 🔧 Core Components Status

##### 1. **✅ Navigation System - COMPLETE**
- **✅ Sidebar Component** (`components/layout/Sidebar.jsx`)
  - ✅ Dashboard link with active state
  - ✅ Profile management link
  - Menu management link (placeholder)
  - QR codes link (placeholder)
  - Responsive collapse on mobile
  - Active state indicators

- **✅ Header Component** (`components/layout/Header.jsx`)
  - ✅ DigiDinez branding
  - ✅ Restaurant name display
  - ✅ User menu dropdown (logout, profile)
  - ✅ Mobile menu toggle

- **✅ Layout Wrapper** (`components/layout/Layout.jsx`)
  - ✅ Combines Header + Sidebar + Main content
  - ✅ Responsive grid layout
  - ✅ Consistent spacing and styling

##### 2. **Profile Management Pages**
- **Profile Page** (`pages/profile/Profile.jsx`)
  - View mode: Display restaurant information in cards
  - Edit mode: Toggle to editable form
  - Restaurant status toggle (Active/Inactive)
  - Success/error notifications
  - Loading states

- **Profile Form** (`pages/profile/ProfileForm.jsx`)
  - Restaurant name, email, phone editing
  - Form validation with real-time feedback
  - Save/Cancel actions
  - Integration with backend validation

- **Address Form** (`pages/profile/AddressForm.jsx`)
  - Street, city, state, zip, country fields
  - Address validation
  - Google Maps integration (future phase)
  - Formatted address display

##### 3. **API Service Layer**
- **Restaurant Service** (`services/restaurantService.js`)
  ```javascript
  // API functions to implement:
  - getProfile()          // GET /api/restaurants/profile
  - updateProfile(data)   // PUT /api/restaurants/profile
  - toggleStatus()        // PATCH /api/restaurants/status
  - getStats()           // GET /api/restaurants/stats (future)
  ```

##### 4. **Custom Hooks**
- **useRestaurant Hook** (`hooks/useRestaurant.js`)
  - Profile data management
  - Update operations with optimistic updates
  - Loading and error states
  - Cache management for profile data

#### 📋 Implementation Checklist

**Week 1: Navigation & Layout**
- [ ] Create Sidebar component with navigation links
- [ ] Build Header component with user menu
- [ ] Implement Layout wrapper component
- [ ] Update Dashboard to use new layout
- [ ] Add routing for profile pages

**Week 2: Profile Management**
- [ ] Build Profile page with view/edit modes
- [ ] Create ProfileForm with validation
- [ ] Implement AddressForm component
- [ ] Add restaurant status toggle functionality
- [ ] Create restaurantService API layer

**Week 3: Integration & Polish**
- [ ] Build useRestaurant custom hook
- [ ] Add loading states and error handling
- [ ] Implement success/error notifications
- [ ] Add form validation and feedback
- [ ] Testing and bug fixes

#### 🎨 UI/UX Requirements
- **Responsive Design**: Desktop/tablet optimized with mobile consideration
- **Form Validation**: Real-time validation with clear error messages
- **Loading States**: Skeleton loaders and spinners
- **Notifications**: Toast notifications for success/error feedback
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Consistent Styling**: Follow established Tailwind patterns

#### 🔌 Backend Integration
**Existing API Endpoints to Use:**
- `GET /api/restaurants/profile` - Fetch restaurant profile
- `PUT /api/restaurants/profile` - Update restaurant profile
- `PATCH /api/restaurants/status` - Toggle active/inactive status

**Data Validation:**
- Email uniqueness validation
- Phone number uniqueness validation
- Required field validation
- Address format validation

#### 📱 Mobile Considerations
- Collapsible sidebar for mobile
- Touch-friendly form inputs
- Optimized for tablet editing
- Responsive card layouts

#### ⚡ **ACCELERATED 1-DAY IMPLEMENTATION PLAN**
**Phase 3 Complete Sprint - 8-10 Hour Timeline**

##### **✅ Session 1: Layout Foundation (2 hours) - COMPLETE**
**Files Created:**
```
admin/src/components/layout/
├── Layout.jsx      # ✅ Main layout with sidebar + header + content area
├── Sidebar.jsx     # ✅ Navigation with Dashboard, Profile, Menu, QR links  
└── Header.jsx      # ✅ DigiDinez branding + user menu + logout dropdown
```

**Implementation Tasks:**
- [x] ✅ Create `Layout.jsx` - Responsive grid layout (sidebar + main content)
- [x] ✅ Build `Sidebar.jsx` - Navigation links with active states
- [x] ✅ Build `Header.jsx` - Restaurant name display + user dropdown
- [x] ✅ Implement responsive mobile menu toggle
- [x] ✅ Add Tailwind CSS styling with primary color scheme
- [x] ✅ Install @heroicons/react and @headlessui/react dependencies
- [x] ✅ Update `Dashboard.jsx` to use Layout component
- [x] ✅ Fix authentication routing with ProtectedRoute and AuthRoute components
- [x] ✅ Add test user credentials (admin@pizzahut.com / coldcold) to instructions

**Success Criteria - ALL ACHIEVED:**
- ✅ Layout renders correctly on desktop/tablet/mobile
- ✅ Sidebar shows proper navigation links with "Soon" labels for future phases
- ✅ Header displays restaurant name from AuthContext
- ✅ Mobile hamburger menu functions properly with overlay
- ✅ User dropdown with Profile and Logout options
- ✅ Active state highlighting for current page (Dashboard highlighted)
- ✅ Responsive design with collapsible sidebar on mobile
- ✅ Protected routing restored - requires authentication to access admin
- ✅ Professional UI following established Tailwind patterns

**Session 1 Complete - Ready for Session 2!** 🎉

##### **✅ Session 2: Navigation Integration (2 hours) - COMPLETE**
**Files Created/Modified:**
```
admin/src/
├── App.jsx                     # ✅ Added comprehensive profile routing structure
├── pages/profile/Profile.jsx   # ✅ Created placeholder profile page with Layout
└── components/layout/          # ✅ Navigation links already functional from Session 1
```

**Implementation Tasks:**
- [x] ✅ Update `App.jsx` routing to include `/profile/*` routes
- [x] ✅ Create placeholder `Profile.jsx` component with Layout integration
- [x] ✅ Add future route placeholders for `/menu/*` and `/qr/*`
- [x] ✅ Test navigation between Dashboard and Profile pages
- [x] ✅ Verify active state indicators work for current page
- [x] ✅ Add protected routing for all new routes

**Success Criteria - ALL ACHIEVED:**
- ✅ All navigation links work correctly (Dashboard ↔ Profile)
- ✅ Profile route accessible with beautiful placeholder page
- ✅ Active states highlight current page correctly
- ✅ Direct URL access properly protected by authentication
- ✅ Future phase placeholders (Menu, QR) accessible and styled
- ✅ Mobile navigation ready for testing
- ✅ Foundation established for Session 3-4 development

**Session 2 Complete - Ready for Session 3!** 🎉

##### **🌞 Session 3: API Service Layer (2 hours)**
**Files to Create:**
```
admin/src/
├── services/restaurantService.js  # API calls for restaurant operations
└── hooks/useRestaurant.js         # Custom hook with state management
```

**Implementation Tasks:**
- [ ] Create `restaurantService.js` with API functions:
  - `getProfile()` - GET /api/restaurants/profile
  - `updateProfile(data)` - PUT /api/restaurants/profile
  - `toggleStatus()` - PATCH /api/restaurants/status
- [ ] Build `useRestaurant.js` custom hook:
  - Profile data state management
  - Loading and error states
  - Optimistic updates for better UX
- [ ] Test backend integration with existing endpoints
- [ ] Handle authentication headers and error responses

**Success Criteria:**
- All API calls work with backend endpoints
- useRestaurant hook manages loading/error states
- Data flows correctly from backend to frontend
- Error handling covers network failures
- Authentication tokens are properly sent
- Error handling covers network failures
- Authentication tokens are properly sent

##### **🌆 Session 4: Profile Pages (2 hours)**
**Files to Create:**
```
admin/src/pages/profile/
├── Profile.jsx     # Main profile page with view/edit toggle
├── ProfileForm.jsx # Restaurant info form (name, email, phone)
└── AddressForm.jsx # Address fields with validation
```

**Implementation Tasks:**
- [ ] Create `Profile.jsx` - Main profile page:
  - View mode: Display restaurant info in organized cards
  - Edit mode: Toggle to editable forms
  - Restaurant status toggle (Active/Inactive)
  - Integration with useRestaurant hook
- [ ] Build `ProfileForm.jsx` - Restaurant details form:
  - Name, email, phone input fields
  - Real-time validation with visual feedback
  - Save/Cancel buttons with confirmation
- [ ] Build `AddressForm.jsx` - Address management:
  - Street, city, state, zip, country fields
  - Address validation and formatting
  - Integration with main profile form
- [ ] Add routing and navigation to profile pages

**Success Criteria:**
- Profile page displays restaurant data correctly
- View/edit mode toggle works smoothly
- Forms validate input with real-time feedback
- Status toggle updates backend immediately
- All form fields connect to backend API

##### **🌆 Session 5: Polish & Testing (2 hours)**
**Files to Create/Modify:**
```
admin/src/components/common/
├── Notification.jsx    # Toast notifications for success/error
└── LoadingSpinner.jsx  # Loading states and spinners

admin/src/pages/profile/ # Add polish to all profile components
```

**Implementation Tasks:**
- [ ] Create `Notification.jsx` - Toast notification system:
  - Success notifications for saved changes
  - Error notifications with detailed messages
  - Auto-dismiss and manual close options
- [ ] Add loading states throughout profile pages:
  - Skeleton loaders for initial data fetch
  - Spinner during form submissions
  - Disabled states during API calls
- [ ] Implement comprehensive form validation:
  - Required field validation
  - Email/phone format validation
  - Backend error handling and display
- [ ] Mobile responsiveness testing and fixes:
  - Test all components on mobile/tablet
  - Ensure forms are touch-friendly
  - Fix any layout issues
- [ ] Final testing and bug fixes:
  - Test all user flows
  - Verify backend integration
  - Check error edge cases

**Success Criteria:**
- Notifications appear for all user actions
- Loading states provide clear feedback
- Forms validate comprehensively
- Mobile experience is smooth and usable
- All edge cases are handled gracefully

#### 🎯 **End-of-Day Success Metrics**
**Phase 3 Complete When:**
- ✅ Complete navigation system with sidebar and header
- ✅ Functional profile management with view/edit modes
- ✅ Working backend integration for all profile operations
- ✅ Status toggle functionality (Active/Inactive restaurant)
- ✅ Form validation with comprehensive error handling
- ✅ Mobile responsive design with touch-friendly interface
- ✅ Loading states and notifications for all user actions
- ✅ Clean, polished UI following established Tailwind patterns

#### 📋 **Implementation Order**
1. **Start with Layout** - Foundation for all admin pages
2. **Add Navigation** - Connect routes and test flow
3. **Build API Layer** - Ensure backend connectivity
4. **Create Profile Pages** - Core functionality
5. **Add Polish** - Loading states, notifications, validation

**Estimated Total Time: 8-10 hours for complete Phase 3 implementation**

### 📅 Phase 4: Menu Management System - UPCOMING
**Estimated Timeline: 3-4 weeks**

#### 🎯 Core Features
- **Menu Items CRUD Interface**
  - Create, read, update, delete menu items
  - Category management (11 predefined categories)
  - Bulk operations (enable/disable multiple items)
  - Advanced filtering and search

- **Menu Item Form System**
  - Comprehensive item details (name, description, price)
  - Category selection with visual indicators
  - Tags and allergens management
  - Spicy level selector (1-5 scale)
  - Preparation time estimation
  - Availability toggle

- **Image Management System**
  - Drag & drop image upload
  - Image preview and cropping
  - Multiple format support (JPEG, PNG, WebP)
  - Image optimization and resizing
  - Bulk image operations

#### 📁 Key Components
```
admin/src/pages/menu/
├── MenuDashboard.jsx       # Overview with stats
├── MenuList.jsx           # List view with filters
├── MenuItemForm.jsx       # Create/edit menu item
├── MenuItemCard.jsx       # Individual item display
├── CategoryManager.jsx    # Category organization
└── BulkActions.jsx        # Bulk edit operations

admin/src/components/menu/
├── ImageUpload.jsx        # Image upload component
├── CategorySelector.jsx   # Category selection UI
├── TagsInput.jsx         # Tags management
├── AllergenSelector.jsx  # Allergen selection
└── SpicyLevelSelector.jsx # Spice level picker
```

#### 🔌 API Integration
- Full integration with existing menu endpoints
- Real-time availability updates
- Image upload with progress tracking
- Optimistic UI updates

### 📅 Phase 5: QR Code & Public Menu System - FINAL
**Estimated Timeline: 2-3 weeks**

#### 🎯 Core Features
- **QR Code Management**
  - Generate QR codes for restaurant menu
  - Download QR codes in multiple formats
  - QR code customization (colors, logos)
  - Print-ready QR code templates

- **Public Menu Preview**
  - Live preview of customer-facing menu
  - Mobile responsiveness testing
  - Restaurant branding preview
  - Direct link sharing

- **Analytics Dashboard**
  - Menu view statistics
  - Popular items tracking
  - QR code scan analytics
  - Customer engagement metrics

#### 📁 Key Components
```
admin/src/pages/qr/
├── QRDashboard.jsx        # QR code management
├── QRGenerator.jsx        # QR code creation
├── QRCustomizer.jsx       # QR code styling
├── MenuPreview.jsx        # Public menu preview
└── Analytics.jsx          # Usage statistics

admin/src/components/qr/
├── QRCodeDisplay.jsx      # QR code visualization
├── QRDownloader.jsx       # Download options
├── MenuThemeSelector.jsx  # Theme customization
└── StatsCard.jsx          # Analytics display
```

#### 🎨 Advanced Features
- **QR Code Customization**
  - Restaurant logo integration
  - Color scheme matching
  - Custom call-to-action text
  - Print-ready templates

- **Menu Theming System**
  - Restaurant-specific color schemes
  - Font selection for public menu
  - Layout customization options
  - Mobile optimization settings

### 🎯 Success Metrics
- **Phase 3**: Complete restaurant profile management with 100% backend integration
- **Phase 4**: Full menu CRUD with image uploads and advanced features
- **Phase 5**: QR code generation and public menu preview system

Each phase builds upon the previous one, creating a comprehensive restaurant management system that seamlessly integrates with the robust backend API.

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

**🚨 SERVERS ALREADY RUNNING - DO NOT START:**
- **Backend API**: http://localhost:3001/api/health ✅ RUNNING
- **Admin Dashboard**: http://localhost:5173/ ✅ RUNNING
- **DO NOT** use terminal commands to start servers - they are already active
- Focus only on code development and file creation/editing

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

# Test User Credentials (for development/testing)
**Test Restaurant Account:**
- Email: admin@pizzahut.com
- Password: coldcold
- Use these credentials for testing authentication and admin features

# Test backend APIs
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "admin@pizzahut.com", "password": "coldcold"}' \
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
```

5. **Important Notes:**
- **NO PostCSS configuration needed** - @tailwindcss/vite handles everything
- **Use `@import 'tailwindcss';`** instead of separate base/components/utilities imports
- **Custom colors defined with `@theme` directive** using OKLCH color space
- **All Tailwind utilities work** out of the box (bg-primary-600, text-primary-700, etc.)
- **Use ONLY Tailwind utility classes** - no custom CSS classes needed
- **Common patterns**: 
  - Buttons: `bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-lg`
  - Cards: `bg-white shadow rounded-lg border border-gray-200 p-6`
  - Inputs: `w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-600`

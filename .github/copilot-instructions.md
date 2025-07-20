# Copilot Instructions for DigiDinez

## � Important Agent Guidelines
- **When asked for implementation plans**: Provide only file paths and purposes, NOT code examples
- **When asked to implement/code**: Provide actual code implementation
- **Be concise in planning**: Focus on file structure and objectives, detailed code comes during implementation

## �🔧 Project Overview
DigiDinez is a full-stack web application that enables restaurants to digitize their menus via QR codes. Restaurant owners can log in, manage their digital menu, and generate a live QR code that customers can scan to view the menu on their phones — no app required.

**🇮🇳 Target Market: India**
- Primary market is India with Indian restaurants as the main users
- All validation rules, formats, and defaults are India-specific
- Phone numbers follow Indian format (+91-XXXXXXXXXX)
- Postal codes follow Indian PIN code format (6 digits)
- Default country is India with Indian states in dropdowns
- Currency formatting and business practices align with Indian standards

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
│   ├── models/                 # Mongoose schemas (ENHANCED)
│   │   ├── Restaurant.js       # Restaurant model with auth methods (India-specific)
│   │   ├── MenuItem.js         # Enhanced menu item model with categories/tags
│   │   ├── MenuCategory.js     # Menu category model (NEW)
│   │   ├── Tag.js             # Tag model for flexible labeling (NEW)
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

## ✅ UI Component Standards - MANDATORY

### 🧩 **Enhanced Component Library**
**All admin UI MUST use these components instead of native HTML elements:**

#### **Button Component** (`components/common/Button.jsx`)
```jsx
// ✅ CORRECT - Use Button component
<Button variant="primary" onClick={handleSave} loading={isLoading}>
  Save Changes
</Button>

// ❌ WRONG - Do not use native buttons
<button className="bg-blue-500 text-white">Save</button>
```

**Available variants:**
- `primary` - Blue background for main actions
- `secondary` - Gray background for secondary actions  
- `danger` - Red background for destructive actions
- `success` - Green background for positive actions
- `ghost` - Transparent background with border

**Built-in features:**
- Loading states with spinner
- Disabled state handling
- Consistent sizing and spacing
- Hover/focus animations

#### **Input Component** (`components/common/Input.jsx`)
```jsx
// ✅ CORRECT - Use Input component
<Input
  label="Restaurant Name"
  type="text"
  value={name}
  onChange={(e) => setName(e.target.value)}
  error={errors.name}
  required
/>

// ❌ WRONG - Do not use native inputs
<input type="text" className="border rounded" />
```

**Built-in features:**
- Label and error display
- Validation state styling
- Required field indicators
- Consistent focus states
- Accessibility attributes

#### **Other Available Components:**
- `<Toast />` - Notifications (success/error/warning)
- `<LoadingSpinner />` - Loading states (sm/md/lg sizes)
- `<ConfirmDialog />` - Modal confirmations with keyboard navigation

### 🚨 **Component Usage Rules:**
1. **NEVER use native `<button>` elements** - Always use `<Button>`
2. **NEVER use native `<input>` elements** - Always use `<Input>` for text fields
3. **Use `<select>` only for dropdowns** - Input component doesn't support select yet
4. **Toast for all notifications** - Replace alert() calls with Toast component
5. **ConfirmDialog for destructive actions** - Status toggles, deletions, etc.
6. **LoadingSpinner during async operations** - Show loading states clearly

### � **Form Development Rules - MANDATORY:**
**When generating ANY form in the admin folder:**

1. **ALWAYS use the `useForm` hook** for form state management:
```jsx
import useForm from '../hooks/useForm'; // ⚠️ DEFAULT IMPORT - NOT NAMED IMPORT

const MyFormComponent = () => {
  const { values, errors, handleChange, handleSubmit, setFieldError } = useForm({
    initialValues: { name: '', email: '' },
    onSubmit: async (formData) => {
      // Handle form submission
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Name"
        name="name"
        value={values.name}
        onChange={handleChange}
        error={errors.name}
      />
      <Button type="submit" variant="primary">Save</Button>
    </form>
  );
};
```

**🚨 CRITICAL: `useForm` Import Convention:**
- ✅ **CORRECT**: `import useForm from '../hooks/useForm';` (default import)
- ❌ **WRONG**: `import { useForm } from '../hooks/useForm';` (named import)
- **The useForm hook is exported as DEFAULT export, not named export**

2. **ALWAYS use React components instead of HTML elements:**
   - ✅ `<Button variant="primary">` instead of `<button>`
   - ✅ `<Input label="Name" />` instead of `<input>`
   - ✅ `<LoadingSpinner />` for loading states
   - ✅ `<Toast />` for notifications

3. **Form validation pattern:**
   - Use `useForm` hook for validation logic
   - Display errors using `error` prop on `<Input>`
   - Handle server errors with `setFieldError()`

### �📋 **Component Migration Checklist:**
When working on any admin page:
- [ ] Replace all `<button>` with `<Button variant="...">`
- [ ] Replace all `<input>` with `<Input label="..." />`
- [ ] Add loading states with `<LoadingSpinner />`
- [ ] Add notifications with `<Toast />`
- [ ] Add confirmations with `<ConfirmDialog />`

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

### 🚨 **CRITICAL API Response Structure**
**Backend APIs wrap entity data in nested objects - Frontend services MUST extract correctly:**

```javascript
// ❌ WRONG - Common mistake in frontend services
const response = await api.get('/restaurants/profile');
setProfile(response.data); // This sets {restaurant: {...}} instead of {...}

// ✅ CORRECT - Extract the nested entity data
const response = await api.get('/restaurants/profile');
setProfile(response.data.restaurant); // Extract the actual restaurant object

// Backend response structure:
{
  "success": true,
  "data": {
    "restaurant": {        // ← Entity is nested here
      "id": "...",
      "name": "Pizza Hut",
      "email": "admin@pizzahut.com",
      // ... actual restaurant data
    }
  }
}

// Menu items follow same pattern:
{
  "success": true,
  "data": {
    "menuItems": [...],    // ← Array of menu items
    "totalItems": 5,
    "categories": [...]
  }
}
```

**When creating frontend services, ALWAYS:**
- Check the actual backend controller response structure
- Extract the nested entity data: `response.data.restaurant`, `response.data.menuItems`, etc.
- Test API integration to verify data flows correctly to UI components
- Use console.log to debug response structure if data appears as "undefined"

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

### ✅ Phase 3: Restaurant Profile Management - COMPLETE
**Production-Ready Restaurant Management System**

**✅ COMPLETED FEATURES:**
- ✅ Complete responsive layout system (Layout, Sidebar, Header components)
- ✅ Navigation infrastructure with mobile support and active states
- ✅ Full profile management with view/edit modes
- ✅ Restaurant status toggle (Active/Inactive) with confirmation dialogs
- ✅ Comprehensive form validation with real-time feedback
- ✅ Address management with country selection
- ✅ API service layer with proper error handling
- ✅ Toast notifications and loading states
- ✅ Mobile-responsive design with touch-friendly interfaces
- ✅ Professional UI components (Button, Input, Toast, LoadingSpinner, ConfirmDialog)
- ✅ Accessibility features (keyboard navigation, ARIA labels)
- ✅ Performance optimizations (single API calls, optimistic updates)

**✅ PRODUCTION-READY COMPONENTS:**
```
admin/src/components/
├── common/
│   ├── Button.jsx             # ✅ Enhanced button with loading states and variants
│   ├── Input.jsx              # ✅ Form input with validation and error display
│   ├── Toast.jsx              # ✅ Toast notifications with auto-dismiss
│   ├── LoadingSpinner.jsx     # ✅ Consistent loading states
│   └── ConfirmDialog.jsx      # ✅ Modal confirmations with keyboard navigation
├── layout/
│   ├── Layout.jsx             # ✅ Main layout wrapper with responsive design
│   ├── Sidebar.jsx            # ✅ Navigation sidebar with mobile support
│   └── Header.jsx             # ✅ App header with user menu and branding
└── forms/                     # Ready for Phase 4 forms

admin/src/pages/profile/
├── Profile.jsx                # ✅ Main profile page with view/edit functionality
├── ProfileForm.jsx            # ✅ Restaurant information form with validation
└── AddressForm.jsx            # ✅ Address management with country selection

admin/src/services/
├── api.js                     # ✅ Base API configuration
├── authService.js             # ✅ Authentication API calls
└── restaurantService.js       # ✅ Restaurant profile API operations

admin/src/hooks/
├── useRestaurant.js           # ✅ Restaurant state management hook
└── useForm.js                 # ✅ Form utilities and validation
```

**✅ KEY FEATURES DELIVERED:**
- **Restaurant Profile Display**: Clean, organized information cards with real data
- **Edit Mode**: Seamless toggle between view and edit with form validation
- **Status Management**: One-click activation/deactivation with confirmations
- **Address Management**: Complete address forms with country selection
- **Real-time Validation**: Client-side and server-side validation alignment
- **Mobile Experience**: Touch-friendly responsive design
- **Error Handling**: Comprehensive network and validation error management
- **Loading States**: Professional loading indicators and button spinners
- **Toast Notifications**: Success/error feedback with auto-dismiss

### ✅ Conventions

### 🚨 **React Import Convention - MANDATORY**

**Rule:** Never import React itself in component files. Only import the specific hooks and features you need.

#### **Correct Import Patterns:**

```jsx
// ✅ CORRECT - Import only what you need
import { useState, useEffect, useRef } from 'react';
import { createContext, useContext } from 'react';
import { forwardRef, useImperativeHandle } from 'react';

// ❌ WRONG - Do not import React
import React, { useState, useEffect } from 'react';
import React from 'react';
```

#### **Common Import Patterns:**
- **Basic components**: No imports needed for JSX
- **State management**: `import { useState } from 'react';`
- **Side effects**: `import { useEffect } from 'react';`
- **Refs**: `import { useRef } from 'react';`
- **Context**: `import { createContext, useContext } from 'react';`
- **Advanced patterns**: `import { forwardRef, useImperativeHandle } from 'react';`

**This convention applies to ALL React components and hooks in the project.**

### 🚨 **React StrictMode Double Execution Fix - MANDATORY**

**Problem:** React StrictMode in development intentionally runs effects twice to help detect side effects. This causes API calls in `useEffect` to execute twice, leading to duplicate network requests.

**Solution:** Always use the useRef pattern to prevent duplicate API calls in useEffect hooks.

#### **Standard Pattern for API Calls in useEffect:**

```jsx
import { useState, useEffect, useRef } from 'react';

const MyComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate calls in React StrictMode
    if (!hasExecutedRef.current) {
      hasExecutedRef.current = true;
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    // API call logic here
  };

  return <div>{/* component JSX */}</div>;
};
```

#### **When to Use This Pattern:**
- ✅ **ANY useEffect that makes API calls**
- ✅ **Authentication checks** (AuthContext)
- ✅ **Data fetching on component mount**
- ✅ **One-time initialization effects**

#### **Components Already Fixed:**
- ✅ `admin/src/pages/profile/Profile.jsx` - Profile data fetching
- ✅ `admin/src/context/AuthContext.jsx` - Authentication check

#### **Migration Checklist for New Components:**
- [ ] Add `import { useRef } from 'react'`
- [ ] Create `const hasExecutedRef = useRef(false);`
- [ ] Wrap API calls in `if (!hasExecutedRef.current)` check
- [ ] Set `hasExecutedRef.current = true;` before API call

**This pattern MUST be used for all future components with useEffect API calls.**

### 🚨 **Authentication Middleware Usage - MANDATORY**

**Problem:** Controllers accessing `req.restaurant._id` when auth middleware sets `req.restaurant.id`

**Root Cause:** The `protect` middleware in `middleware/auth.js` sets:
```javascript
req.restaurant = {
  id: restaurant._id,        // ✅ Use req.restaurant.id
  name: restaurant.name,
  email: restaurant.email,
  phone: restaurant.phone
};
```

#### **Correct Usage in Controllers:**
```javascript
// ✅ CORRECT - Use req.restaurant.id
const getTags = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id; // ✅ .id not ._id
    const tags = await Tag.findByRestaurant(restaurantId);
    // ...
  }
};

// ❌ WRONG - This will be undefined
const getTags = async (req, res) => {
  try {
    const restaurantId = req.restaurant._id; // ❌ undefined
    // ...
  }
};
```

#### **Controllers Already Fixed:**
- ✅ `menuController.js` - Uses `req.restaurant.id`
- ✅ `tagController.js` - Fixed to use `req.restaurant.id`
- ✅ `restaurantController.js` - Uses `req.restaurant.id`

**This pattern MUST be used in ALL controllers that access restaurant data.**

### 🚨 **Route Order in Express - MANDATORY**

**Problem:** More specific routes must be defined before general routes in Express.

**Root Cause:** Express matches routes in order. `/api/menu` will match before `/api/menu/tags`.

#### **Correct Route Order in server.js:**
```javascript
// ✅ CORRECT - Specific routes first
app.use('/api/auth', authRoutes);
app.use('/api/menu/tags', tagRoutes);      // ✅ Specific route first
app.use('/api/menu', menuRoutes);          // ✅ General route after
app.use('/api/restaurants', restaurantRoutes);

// ❌ WRONG - General route catches all
app.use('/api/menu', menuRoutes);          // ❌ This catches /api/menu/tags
app.use('/api/menu/tags', tagRoutes);      // ❌ Never reached
```

#### **Route Conflicts to Avoid:**
- `/api/menu/tags` must come before `/api/menu`
- `/api/restaurants/profile` must come before `/api/restaurants/:id`
- Any specific path must come before wildcard or parameterized paths

**This pattern MUST be followed when adding new route modules.**

### 🚨 **Route Order in Express - MANDATORY**

**Problem:** When using the `useForm` hook in components with `useEffect`, functions like `resetForm` and `setFormErrors` can cause infinite loops if they're included in dependency arrays without being wrapped in `useCallback`.

**Root Cause:** Functions in React components are recreated on every render. When these functions are dependencies in `useEffect`, the effect runs infinitely because the function reference changes each time.

#### **Symptoms:**
- Console error: "Maximum update depth exceeded"
- Browser becomes unresponsive
- Component re-renders continuously

#### **Solution:** Wrap all functions returned by `useForm` in `useCallback`

**In `useForm.js` - ALWAYS wrap these functions:**
```javascript
// ✅ CORRECT - Wrapped in useCallback
const resetForm = useCallback(() => {
  setValues(initialValues);
  setErrors({});
  setTouched({});
  setIsSubmitting(false);
}, [initialValues]);

const setFormErrors = useCallback((apiErrors) => {
  if (typeof apiErrors === 'string') {
    setErrors({ general: apiErrors });
  } else if (typeof apiErrors === 'object') {
    setErrors(apiErrors);
  }
}, []);

const setFormValues = useCallback((newValues) => {
  setValues(newValues);
}, []);

// ❌ WRONG - Not wrapped, causes infinite loops
const resetForm = () => {
  setValues(initialValues);
  setErrors({});
  setTouched({});
  setIsSubmitting(false);
};
```

**In Form Components - Avoid function dependencies when possible:**
```javascript
// ✅ PREFERRED - Use setFormValues directly instead of resetForm
useEffect(() => {
  if (editData) {
    setFormValues(editData);
  } else {
    setFormValues(initialValues); // Better than resetForm()
  }
}, [editData, setFormValues]); // setFormValues is wrapped in useCallback

// ❌ PROBLEMATIC - resetForm in dependencies
useEffect(() => {
  if (!editData) {
    resetForm(); // Avoid this pattern
  }
}, [editData, resetForm]);
```

#### **Functions That Must Be Wrapped in useCallback:**
- ✅ `resetForm`
- ✅ `setFormErrors` 
- ✅ `setFormValues`
- ✅ `validateForm`
- ✅ Any custom form utility functions

#### **Components Already Fixed:**
- ✅ `admin/src/hooks/useForm.js` - All returned functions wrapped
- ✅ `admin/src/components/menu/CategoryForm.jsx` - Uses setFormValues instead of resetForm
- ✅ `admin/src/components/menu/TagForm.jsx` - Uses setFormValues for both edit and create modes
- ✅ `admin/src/components/forms/ProfileForm.jsx` - Previous fix applied

#### **Specific Pattern for Edit/Create Forms:**
```javascript
// ✅ CORRECT - Use setFormValues for both cases, avoid resetForm in useEffect
useEffect(() => {
  if (editingItem) {
    setFormValues({
      name: editingItem.name,
      description: editingItem.description
    });
  } else {
    // Use setFormValues instead of resetForm()
    setFormValues({
      name: '',
      description: ''
    });
  }
}, [editingItem, setFormValues]); // Only setFormValues in dependencies

// ❌ WRONG - Using resetForm in useEffect dependencies
useEffect(() => {
  if (editingItem) {
    setFormValues(editingItem);
  } else {
    resetForm(); // Causes infinite loop
  }
}, [editingItem, setFormValues, resetForm]); // resetForm causes re-renders
```

**This pattern MUST be implemented in ALL form-related hooks and components.**

### 📅 Phase 4: Menu Management System - 5 FOCUSED SESSIONS
**Restaurant-facing admin panel to manage digital menus in structured development sessions.**

#### 🎯 Development Strategy
This phase is built in **5 focused development sessions**, each with specific scope and visual outcomes:

---

## ✅ **Session 1: Menu Category Management (CRUD + Reordering) - COMPLETE**

**Goal:** Enable restaurant to create, view, edit, delete, and reorder menu categories.

**✅ COMPLETED - Backend Implementation:**
- ✅ Enhanced `MenuCategory` model with fields: `name`, `restaurantId`, `sortOrder`, `isActive`
- ✅ Routes: `GET /categories`, `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id`, `PATCH /categories/reorder`
- ✅ Restaurant-scoped categories with sort order persistence
- ✅ Reorder endpoint with batch updates for drag-and-drop functionality

**✅ COMPLETED - Frontend Implementation:**
- ✅ Category management page with statistics dashboard
- ✅ Drag-and-drop reordering using `@dnd-kit` (React 19 compatible)
- ✅ Add/Edit/Delete category forms with validation
- ✅ Real-time visual feedback and optimistic updates
- ✅ Toast notifications and comprehensive error handling
- ✅ Loading states and empty states

**✅ COMPLETED - Key Components:**
- ✅ `admin/src/services/categoryService.js` - Complete CRUD API integration
- ✅ `admin/src/hooks/useCategories.js` - State management with optimistic updates
- ✅ `admin/src/components/menu/CategoryForm.jsx` - Modal form with useForm hook
- ✅ `admin/src/components/menu/CategoryCard.jsx` - Individual category display
- ✅ `admin/src/components/menu/CategoryList.jsx` - Drag-and-drop list component
- ✅ `admin/src/pages/menu/Categories.jsx` - Main management interface
- ✅ Updated sidebar navigation to enable "Menu Management" link

**✅ DEFINITION OF DONE - ALL COMPLETE:**
- ✅ Admin can visually manage categories and reorder them
- ✅ Changes persist in database and reflect immediately in UI
- ✅ Drag-and-drop reordering works smoothly
- ✅ Form validation prevents duplicates
- ✅ Loading states and error handling implemented
- ✅ Statistics dashboard shows category counts

**🚀 STATUS: Session 1 is production-ready and fully tested!**

---

## ✅ **Session 2: Tag Management + Inline Tag Support - COMPLETE**

**Goal:** Allow restaurants to define custom tags and assign them to menu items.

**✅ COMPLETED - Backend Implementation:**
- ✅ Enhanced `Tag` model with fields: `name`, `slug`, `color`, `restaurantId`, `isActive`
- ✅ Routes: `GET /api/menu/tags`, `POST /api/menu/tags`, `PUT /api/menu/tags/:id`, `DELETE /api/menu/tags/:id`
- ✅ Auto-generate `slug` using kebab-case transformation from name
- ✅ Restaurant-scoped tags with uniqueness validation per restaurant
- ✅ Tag usage tracking with menuItemsCount integration

**✅ COMPLETED - Frontend Implementation:**
- ✅ Complete tag management interface with statistics dashboard
- ✅ Color-coded tag system with predefined and custom color options
- ✅ Add/Edit/Delete tag functionality with comprehensive validation
- ✅ Tag status toggle (Active/Inactive) with confirmation dialogs
- ✅ Search and filtering capabilities for large tag collections
- ✅ Real-time visual feedback and optimistic updates
- ✅ Toast notifications and comprehensive error handling

**✅ COMPLETED - Key Components:**
- ✅ `backend/controllers/tagController.js` - Complete CRUD operations with authentication
- ✅ `backend/routes/tagRoutes.js` - Protected API endpoints with validation
- ✅ `admin/src/services/tagService.js` - Complete API integration layer
- ✅ `admin/src/hooks/useTags.js` - State management with optimistic updates
- ✅ `admin/src/components/menu/TagForm.jsx` - Modal form with color picker and validation
- ✅ `admin/src/components/menu/TagCard.jsx` - Individual tag display with actions
- ✅ `admin/src/components/menu/TagList.jsx` - Tag collection display with search
- ✅ `admin/src/components/menu/TagSelector.jsx` - Multi-select component (ready for Session 3)
- ✅ `admin/src/pages/menu/Tags.jsx` - Main tag management interface

**✅ DEFINITION OF DONE - ALL COMPLETE:**
- ✅ Admin can create, edit, delete, and manage tag colors
- ✅ Tag uniqueness validation prevents duplicates per restaurant
- ✅ Tag status management with confirmation dialogs
- ✅ Statistics dashboard shows tag counts and usage
- ✅ Search and filtering for efficient tag management
- ✅ Error handling and loading states implemented
- ✅ TagSelector component ready for menu item integration

**🚀 STATUS: Session 2 is production-ready and fully tested!**

---

## ✅ **Session 3: Menu Item CRUD with Tag + Category Selection**

**Goal:** Enable full menu item management with comprehensive field support.

**Backend Requirements:**
- Enhanced `MenuItem` model with fields:
  - `name`, `price`, `description`, `restaurantId`, `isAvailable`
  - `isVeg`, `isSpicy`, `spicyLevel`, `categoryIds`, `tagIds`
  - `nutritionInfo`, `allergens`, `preparationTime`
- CRUD routes: `GET /items`, `POST /items`, `PUT /items/:id`, `DELETE /items/:id`
- Population of category and tag relationships

**Frontend Requirements:**
- Menu item list with filtering and search
- Comprehensive Add/Edit form with:
  - Category multi-select dropdown
  - Tag multi-select with inline creation
  - Availability, Vegetarian, Spicy toggles
  - Spicy level slider (1-5 scale)
  - Nutrition information fields
  - Allergen selection checkboxes

**Definition of Done:**
- Admin can create and manage complete menu items with all relevant fields
- Form validation and error handling implemented
- List view shows items with visual indicators (veg, spicy, etc.)

---

## ✅ **Session 4: Bulk Upload via Excel/CSV**

**Goal:** Allow restaurant admins to bulk upload menu data from Excel/CSV files.

**Backend Requirements:**
- File upload endpoint using `multer`
- Excel/CSV parsing with `xlsx` or `csv-parser`
- Auto-creation of new categories/tags if not found
- Field validation for: name, price, category, tags, etc.
- Batch processing with error reporting

**Frontend Requirements:**
- File upload interface with drag-and-drop support
- Upload progress indicator
- Success/failure results display with row-by-row feedback
- Downloadable sample template (Excel/CSV)
- Data preview before final import

**Definition of Done:**
- Admin uploads a valid Excel file and sees new items created
- Clear feedback on successful imports and validation errors
- Sample template helps admin format data correctly

---

## ✅ **Session 5: Image Upload (Basic) + Placeholder System**

**Goal:** Enable image uploads for menu items with MVP-safe implementation.

**Backend Requirements:**
- Add `image` field to `MenuItem` model
- File upload using `multer` middleware
- Image storage in `/uploads/menu-images/` with unique filenames
- Static file serving route for images
- Image validation (format, size limits)

**Frontend Requirements:**
- Image upload field in menu item form
- Thumbnail preview in list and edit views
- Fallback placeholder for items without images
- Basic image validation on frontend
- Visual upload progress indicator

**Definition of Done:**
- Admin can upload images for menu items
- Images appear correctly in list and detail views
- Graceful handling of missing images with placeholders

---

#### 📁 **Phase 4 File Structure**
```
admin/src/pages/menu/
├── Categories.jsx          # Session 1: Category management
├── Tags.jsx               # Session 2: Tag management  
├── MenuItems.jsx          # Session 3: Menu item CRUD
├── BulkUpload.jsx         # Session 4: Excel/CSV upload
└── components/
    ├── CategoryList.jsx    # Drag-drop category reordering
    ├── TagSelector.jsx     # Multi-select with inline creation
    ├── MenuItemForm.jsx    # Comprehensive item form
    ├── MenuItemCard.jsx    # Item display with indicators
    ├── BulkUploader.jsx    # File upload with progress
    └── ImageUpload.jsx     # Session 5: Image upload component

admin/src/services/
├── categoryService.js      # Category CRUD operations
├── tagService.js          # Tag management APIs  
├── menuItemService.js     # Menu item CRUD operations
└── bulkUploadService.js   # File upload and processing

backend/models/
├── MenuCategory.js        # Category model (enhanced)
├── Tag.js                # Tag model (enhanced)  
└── MenuItem.js           # Menu item model (enhanced)

backend/routes/
├── categoryRoutes.js      # Category management endpoints
├── tagRoutes.js          # Tag management endpoints
└── menuRoutes.js         # Enhanced menu item endpoints
```

#### � **Session Dependencies**
- **Session 1** → Independent (categories foundation)
- **Session 2** → Independent (tags foundation)  
- **Session 3** → Depends on Sessions 1 & 2 (uses categories + tags)
- **Session 4** → Depends on Sessions 1, 2 & 3 (bulk creates items)
- **Session 5** → Depends on Session 3 (adds images to existing items)

#### 🎯 **Success Metrics**
- **Each session produces working, testable features**
- **Visual progress after each session**
- **Backend APIs fully tested and documented**
- **Frontend components follow established UI patterns**
- **Mobile-responsive design maintained throughout**

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

### 🍽️ Menu Management System - ENHANCED
- ✅ Complete CRUD operations for menu items with category/tag relationships
- ✅ Flexible category system per restaurant (create, update, delete categories)
- ✅ Tag system for flexible labeling (e.g., "high protein", "jain special")
- ✅ Enhanced features: vegetarian/spicy indicators, nutrition info, allergens
- ✅ Advanced search with text indexing on name and description
- ✅ Image upload system with validation (JPEG, PNG, WebP, 5MB max)
- ✅ Public menu API with populated category/tag data

**Menu Items Endpoints:**
```
GET    /api/menu/items                    # Get restaurant's menu items (with population)
POST   /api/menu/items                    # Create new menu item (with categoryIds/tagIds)
GET    /api/menu/items/:id                # Get specific menu item
PUT    /api/menu/items/:id                # Update menu item
DELETE /api/menu/items/:id                # Delete menu item
PATCH  /api/menu/items/:id/availability   # Toggle availability
POST   /api/menu/items/:id/image          # Upload item image
GET    /api/menu/items/:id/image          # Get item image info
DELETE /api/menu/items/:id/image          # Delete item image
GET    /api/menu/public/:restaurantId     # Public menu (no auth)
```

**Category Management Endpoints:** *(NEW)*
```
GET    /api/menu/categories               # Get restaurant's categories
POST   /api/menu/categories               # Create new category
PUT    /api/menu/categories/:id           # Update category
DELETE /api/menu/categories/:id           # Delete category (if no items use it)
```

**Tag Management Endpoints:** *(NEW)*
```
GET    /api/menu/tags                     # Get restaurant's tags
POST   /api/menu/tags                     # Create new tag
PUT    /api/menu/tags/:id                 # Update tag
DELETE /api/menu/tags/:id                 # Delete tag (if no items use it)
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

### 📊 Database Models - ENHANCED SCHEMA

**Restaurant Model:**
- name, email (unique), phone (unique), password (hashed)
- address (street, city, state, zipCode, country) - India-specific validation
- isActive, qrCodeUrl, timestamps
- Authentication methods: comparePassword(), generateAuthToken()
- Virtual: fullAddress

**MenuCategory Model:** *(NEW)*
- name, sortOrder, isActive, restaurantId (reference)
- Compound unique index: (restaurantId, name)
- Static methods: findByRestaurant()
- Instance methods: getMenuItemsCount()

**Tag Model:** *(NEW)*
- name, slug (auto-generated), color, isActive, restaurantId (reference)
- Compound unique index: (restaurantId, name), (restaurantId, slug)
- Pre-save hook: generates kebab-case slug from name
- Static methods: findByRestaurant()
- Instance methods: getMenuItemsCount()

**MenuItem Model:** *(ENHANCED)*
- name, description, price, isVeg, isSpicy, spicyLevel (0-5)
- restaurantId (reference), categoryIds[], tagIds[]
- image (object: filename, path, size, mimetype, uploadedAt)
- preparationTime, sortOrder, isAvailable
- nutritionInfo: calories, protein, carbs, fat
- allergens[] (predefined list), timestamps
- Virtuals: formattedPrice (₹), imageUrl, spicyLevelText, preparationTimeText
- Text search index on name + description
- Static methods: findByRestaurant(), getCategoriesByRestaurant(), searchItems()

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

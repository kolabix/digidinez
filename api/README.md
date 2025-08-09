# DigiDinez API Documentation

## Overview

DigiDinez is a full-stack web application for Indian restaurants to digitize their menus via QR codes. This API provides authentication, menu management, restaurant profile management, and QR code generation functionality.

**Base URL:** `http://localhost:3001/api`  
**Environment:** Node.js + Express + MongoDB  
**Authentication:** JWT tokens stored in HTTP-only cookies

## Table of Contents

1. [Authentication](#authentication)
2. [Restaurant Management](#restaurant-management)
3. [Menu Management](#menu-management)
4. [Tag Management](#tag-management)
5. [QR Code Management](#qr-code-management)
6. [Health Check](#health-check)
7. [Response Format](#response-format)
8. [Error Handling](#error-handling)
9. [Data Models](#data-models)

---

## Authentication

### Register Restaurant
**POST** `/api/auth/register`

Register a new restaurant account.

**Request Body:**
```json
{
  "name": "Pizza Hut",
  "email": "admin@pizzahut.com",
  "phone": "+919876543210",
  "password": "coldcold",
  "address": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Restaurant registered successfully",
  "data": {
    "restaurant": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Pizza Hut",
      "email": "admin@pizzahut.com",
      "phone": "+919876543210",
      "isActive": true
    }
  }
}
```

### Login
**POST** `/api/auth/login`

Authenticate restaurant and receive JWT token.

**Request Body:**
```json
{
  "identifier": "admin@pizzahut.com", // email or phone
  "password": "coldcold"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "restaurant": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Pizza Hut",
      "email": "admin@pizzahut.com",
      "phone": "+919876543210",
      "isActive": true
    }
  }
}
```

### Get Current User
**GET** `/api/auth/me`

Get current authenticated restaurant profile.

**Headers:** `Cookie: authToken=<jwt_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurant": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Pizza Hut",
      "email": "admin@pizzahut.com",
      "phone": "+919876543210",
      "address": {
        "street": "123 Main Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "zipCode": "400001",
        "country": "India"
      },
      "isActive": true,
      "qrCodeUrl": "http://localhost:3001/qr-codes/restaurant_64f8a1b2c3d4e5f6a7b8c9d0.png",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Logout
**POST** `/api/auth/logout`

Logout and clear authentication cookie.

**Headers:** `Cookie: authToken=<jwt_token>`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Refresh Token
**POST** `/api/auth/refresh`

Refresh JWT token.

**Headers:** `Cookie: authToken=<jwt_token>`

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully"
}
```

---

## Restaurant Management

### Get Profile
**GET** `/api/restaurants/profile`

Get restaurant profile information.

**Headers:** `Cookie: authToken=<jwt_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurant": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Pizza Hut",
      "email": "admin@pizzahut.com",
      "phone": "+919876543210",
      "address": {
        "street": "123 Main Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "zipCode": "400001",
        "country": "India"
      },
      "isActive": true,
      "qrCodeUrl": "http://localhost:3001/qr-codes/restaurant_64f8a1b2c3d4e5f6a7b8c9d0.png",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Update Profile
**PUT** `/api/restaurants/profile`

Update restaurant profile information.

**Headers:** `Cookie: authToken=<jwt_token>`

**Request Body:**
```json
{
  "name": "Pizza Hut - Updated",
  "address": {
    "street": "456 New Street",
    "city": "Delhi",
    "state": "Delhi",
    "zipCode": "110001",
    "country": "India"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "restaurant": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Pizza Hut - Updated",
      "email": "admin@pizzahut.com",
      "phone": "+919876543210",
      "address": {
        "street": "456 New Street",
        "city": "Delhi",
        "state": "Delhi",
        "zipCode": "110001",
        "country": "India"
      },
      "isActive": true,
      "qrCodeUrl": "http://localhost:3001/qr-codes/restaurant_64f8a1b2c3d4e5f6a7b8c9d0.png",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### Toggle Status
**PATCH** `/api/restaurants/status`

Toggle restaurant active/inactive status.

**Headers:** `Cookie: authToken=<jwt_token>`

**Request Body:**
```json
{
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "data": {
    "restaurant": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "isActive": false
    }
  }
}
```

### Get Statistics
**GET** `/api/restaurants/stats`

Get restaurant statistics.

**Headers:** `Cookie: authToken=<jwt_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalMenuItems": 25,
      "availableItems": 20,
      "totalCategories": 5,
      "totalTags": 8,
      "hasQRCode": true,
      "lastUpdated": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

---

## Menu Management

### Get Menu Items
**GET** `/api/menu/items`

Get all menu items for authenticated restaurant with filtering and pagination.

**Headers:** `Cookie: authToken=<jwt_token>`

**Query Parameters:**
- `category` (string): Filter by category name
- `isAvailable` (boolean): Filter by availability
- `limit` (number): Number of items per page (default: 50)
- `sort` (string): Sort order (default: "category name")
- `search` (string): Search in name and description
- `categories` (string): Comma-separated category IDs
- `tags` (string): Comma-separated tag IDs
- `isVeg` (boolean): Filter by vegetarian status
- `spicyLevel` (number): Maximum spicy level (0-3)

**Example Request:**
```
GET /api/menu/items?category=Pizza&isAvailable=true&limit=10&sort=-price
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": {
    "menuItems": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "Margherita Pizza",
        "description": "Classic tomato and mozzarella pizza",
        "price": 299.99,
        "categoryIds": [
          {
            "id": "64f8a1b2c3d4e5f6a7b8c9d2",
            "name": "Pizza"
          }
        ],
        "tagIds": [
          {
            "id": "64f8a1b2c3d4e5f6a7b8c9d3",
            "name": "Vegetarian",
            "color": "#4CAF50"
          }
        ],
        "image": {
          "filename": "margherita.jpg",
          "url": "http://localhost:3001/uploads/margherita.jpg",
          "size": 1024000,
          "mimetype": "image/jpeg",
          "uploadedAt": "2024-01-15T10:30:00.000Z"
        },
        "isAvailable": true,
        "isVeg": true,
        "isSpicy": false,
        "spicyLevel": 0,
        "preparationTime": 20,
        "nutritionInfo": {
          "calories": 800,
          "protein": 25,
          "carbs": 80,
          "fat": 30
        },
        "allergens": ["dairy", "wheat"],
        "sortOrder": 1,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "categories": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "Pizza",
        "sortOrder": 1
      }
    ]
  }
}
```

### Get Single Menu Item
**GET** `/api/menu/items/:id`

Get a specific menu item by ID.

**Headers:** `Cookie: authToken=<jwt_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "menuItem": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "Margherita Pizza",
      "description": "Classic tomato and mozzarella pizza",
      "price": 299.99,
      "categoryIds": [
        {
          "id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "name": "Pizza"
        }
      ],
      "tagIds": [
        {
          "id": "64f8a1b2c3d4e5f6a7b8c9d3",
          "name": "Vegetarian",
          "color": "#4CAF50"
        }
      ],
      "image": {
        "filename": "margherita.jpg",
        "url": "http://localhost:3001/uploads/margherita.jpg",
        "size": 1024000,
        "mimetype": "image/jpeg",
        "uploadedAt": "2024-01-15T10:30:00.000Z"
      },
      "isAvailable": true,
      "isVeg": true,
      "isSpicy": false,
      "spicyLevel": 0,
      "preparationTime": 20,
      "nutritionInfo": {
        "calories": 800,
        "protein": 25,
        "carbs": 80,
        "fat": 30
      },
      "allergens": ["dairy", "wheat"],
      "sortOrder": 1,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Create Menu Item
**POST** `/api/menu/items`

Create a new menu item.

**Headers:** `Cookie: authToken=<jwt_token>`

**Request Body:**
```json
{
  "name": "Pepperoni Pizza",
  "description": "Spicy pepperoni with melted cheese",
  "price": 399.99,
  "categoryIds": ["64f8a1b2c3d4e5f6a7b8c9d2"],
  "tagIds": ["64f8a1b2c3d4e5f6a7b8c9d4"],
  "isAvailable": true,
  "isVeg": false,
  "isSpicy": true,
  "spicyLevel": 2,
  "preparationTime": 25,
  "nutritionInfo": {
    "calories": 900,
    "protein": 30,
    "carbs": 85,
    "fat": 35
  },
  "allergens": ["dairy", "wheat"],
  "sortOrder": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Menu item created successfully",
  "data": {
    "menuItem": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "name": "Pepperoni Pizza",
      "description": "Spicy pepperoni with melted cheese",
      "price": 399.99,
      "categoryIds": [
        {
          "id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "name": "Pizza"
        }
      ],
      "tagIds": [
        {
          "id": "64f8a1b2c3d4e5f6a7b8c9d4",
          "name": "Non-Vegetarian",
          "color": "#F44336"
        }
      ],
      "isAvailable": true,
      "isVeg": false,
      "isSpicy": true,
      "spicyLevel": 2,
      "preparationTime": 25,
      "nutritionInfo": {
        "calories": 900,
        "protein": 30,
        "carbs": 85,
        "fat": 35
      },
      "allergens": ["dairy", "wheat"],
      "sortOrder": 2,
      "createdAt": "2024-01-15T11:00:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### Update Menu Item
**PUT** `/api/menu/items/:id`

Update an existing menu item.

**Headers:** `Cookie: authToken=<jwt_token>`

**Request Body:**
```json
{
  "name": "Pepperoni Pizza - Updated",
  "price": 449.99,
  "isAvailable": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Menu item updated successfully",
  "data": {
    "menuItem": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "name": "Pepperoni Pizza - Updated",
      "price": 449.99,
      "isAvailable": false,
      "updatedAt": "2024-01-15T11:30:00.000Z"
    }
  }
}
```

### Delete Menu Item
**DELETE** `/api/menu/items/:id`

Delete a menu item.

**Headers:** `Cookie: authToken=<jwt_token>`

**Response:**
```json
{
  "success": true,
  "message": "Menu item deleted successfully"
}
```

### Toggle Availability
**PATCH** `/api/menu/items/:id/toggle`

Toggle menu item availability.

**Headers:** `Cookie: authToken=<jwt_token>`

**Response:**
```json
{
  "success": true,
  "message": "Availability toggled successfully",
  "data": {
    "menuItem": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "isAvailable": false
    }
  }
}
```

### Get Menu Items by Category
**GET** `/api/menu/items/category/:category`

Get menu items filtered by category name.

**Headers:** `Cookie: authToken=<jwt_token>`

**Query Parameters:** Same as Get Menu Items

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": {
    "menuItems": [...],
    "category": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "name": "Pizza"
    }
  }
}
```

### Bulk Update Menu Items
**PUT** `/api/menu/items/bulk`

Update multiple menu items at once.

**Headers:** `Cookie: authToken=<jwt_token>`

**Request Body:**
```json
{
  "updates": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "price": 349.99,
      "isAvailable": true
    },
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "price": 499.99,
      "isAvailable": false
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk update completed successfully",
  "data": {
    "updatedCount": 2,
    "menuItems": [...]
  }
}
```

### Upload Menu Item Image
**POST** `/api/menu/items/:id/image`

Upload an image for a menu item.

**Headers:** `Cookie: authToken=<jwt_token>`

**Request Body:** `multipart/form-data`
- `image`: Image file (JPEG, PNG, WebP)

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "image": {
      "filename": "pepperoni_pizza.jpg",
      "url": "http://localhost:3001/uploads/pepperoni_pizza.jpg",
      "size": 2048000,
      "mimetype": "image/jpeg",
      "uploadedAt": "2024-01-15T12:00:00.000Z"
    }
  }
}
```

### Get Menu Item Image
**GET** `/api/menu/items/:id/image`

Get the image URL for a menu item.

**Headers:** `Cookie: authToken=<jwt_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "image": {
      "filename": "pepperoni_pizza.jpg",
      "url": "http://localhost:3001/uploads/pepperoni_pizza.jpg",
      "size": 2048000,
      "mimetype": "image/jpeg",
      "uploadedAt": "2024-01-15T12:00:00.000Z"
    }
  }
}
```

### Delete Menu Item Image
**DELETE** `/api/menu/items/:id/image`

Delete the image for a menu item.

**Headers:** `Cookie: authToken=<jwt_token>`

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

### Get Public Menu
**GET** `/api/menu/public/:restaurantId`

Get public menu for a restaurant (no authentication required).

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurant": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Pizza Hut",
      "address": {
        "street": "123 Main Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "zipCode": "400001",
        "country": "India"
      }
    },
    "categories": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "Pizza",
        "sortOrder": 1,
        "menuItems": [...]
      }
    ],
    "tags": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "name": "Vegetarian",
        "color": "#4CAF50"
      }
    ]
  }
}
```

### Get Menu Categories
**GET** `/api/menu/categories`

Get all menu categories for the authenticated restaurant.

**Headers:** `Cookie: authToken=<jwt_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "Pizza",
        "sortOrder": 1,
        "menuItemCount": 5,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### Create Menu Category
**POST** `/api/menu/categories`

Create a new menu category.

**Headers:** `Cookie: authToken=<jwt_token>`

**Request Body:**
```json
{
  "name": "Beverages",
  "sortOrder": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "category": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d6",
      "name": "Beverages",
      "sortOrder": 2,
      "createdAt": "2024-01-15T12:30:00.000Z",
      "updatedAt": "2024-01-15T12:30:00.000Z"
    }
  }
}
```

### Update Menu Category
**PUT** `/api/menu/categories/:id`

Update a menu category.

**Headers:** `Cookie: authToken=<jwt_token>`

**Request Body:**
```json
{
  "name": "Soft Drinks",
  "sortOrder": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "category": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d6",
      "name": "Soft Drinks",
      "sortOrder": 3,
      "updatedAt": "2024-01-15T13:00:00.000Z"
    }
  }
}
```

### Delete Menu Category
**DELETE** `/api/menu/categories/:id`

Delete a menu category.

**Headers:** `Cookie: authToken=<jwt_token>`

**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

### Reorder Categories
**PATCH** `/api/menu/categories/reorder`

Reorder menu categories.

**Headers:** `Cookie: authToken=<jwt_token>`

**Request Body:**
```json
{
  "categoryOrders": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "sortOrder": 1
    },
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d6",
      "sortOrder": 2
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Categories reordered successfully",
  "data": {
    "categories": [...]
  }
}
```

---

## Tag Management

### Get Tags
**GET** `/api/menu/tags`

Get all tags for the authenticated restaurant.

**Headers:** `Cookie: authToken=<jwt_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "tags": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "name": "Vegetarian",
        "color": "#4CAF50",
        "isActive": true,
        "menuItemCount": 15,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### Create Tag
**POST** `/api/menu/tags`

Create a new tag.

**Headers:** `Cookie: authToken=<jwt_token>`

**Request Body:**
```json
{
  "name": "Spicy",
  "color": "#FF5722"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tag created successfully",
  "data": {
    "tag": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d7",
      "name": "Spicy",
      "color": "#FF5722",
      "isActive": true,
      "createdAt": "2024-01-15T13:30:00.000Z",
      "updatedAt": "2024-01-15T13:30:00.000Z"
    }
  }
}
```

### Update Tag
**PUT** `/api/menu/tags/:id`

Update a tag.

**Headers:** `Cookie: authToken=<jwt_token>`

**Request Body:**
```json
{
  "name": "Very Spicy",
  "color": "#D32F2F",
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tag updated successfully",
  "data": {
    "tag": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d7",
      "name": "Very Spicy",
      "color": "#D32F2F",
      "isActive": false,
      "updatedAt": "2024-01-15T14:00:00.000Z"
    }
  }
}
```

### Delete Tag
**DELETE** `/api/menu/tags/:id`

Delete a tag.

**Headers:** `Cookie: authToken=<jwt_token>`

**Response:**
```json
{
  "success": true,
  "message": "Tag deleted successfully"
}
```

### Get Public Tags
**GET** `/api/menu/tags/public/:restaurantId`

Get public tags for a restaurant (no authentication required).

**Response:**
```json
{
  "success": true,
  "data": {
    "tags": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "name": "Vegetarian",
        "color": "#4CAF50"
      }
    ]
  }
}
```

---

## QR Code Management

### Generate QR Code
**POST** `/api/restaurants/generate-qr`

Generate a QR code for the restaurant.

**Headers:** `Cookie: authToken=<jwt_token>`

**Response:**
```json
{
  "success": true,
  "message": "QR code generated successfully",
  "data": {
    "qrCode": {
      "url": "http://localhost:3001/qr-codes/restaurant_64f8a1b2c3d4e5f6a7b8c9d0.png",
      "downloadUrl": "http://localhost:3001/api/restaurants/qr/download",
      "createdAt": "2024-01-15T14:30:00.000Z"
    }
  }
}
```

### Get QR Code
**GET** `/api/restaurants/qr`

Get the current QR code for the restaurant.

**Headers:** `Cookie: authToken=<jwt_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "qrCode": {
      "url": "http://localhost:3001/qr-codes/restaurant_64f8a1b2c3d4e5f6a7b8c9d0.png",
      "downloadUrl": "http://localhost:3001/api/restaurants/qr/download",
      "createdAt": "2024-01-15T14:30:00.000Z"
    }
  }
}
```

### Delete QR Code
**DELETE** `/api/restaurants/qr`

Delete the current QR code for the restaurant.

**Headers:** `Cookie: authToken=<jwt_token>`

**Response:**
```json
{
  "success": true,
  "message": "QR code deleted successfully"
}
```

### Get QR Code Image (Public)
**GET** `/api/restaurants/:id/qr`

Get QR code image for a restaurant (no authentication required).

**Response:** Image file (PNG)

---

## Health Check

### Health Check
**GET** `/health`

Check API health and database connection status.

**Response:**
```json
{
  "success": true,
  "message": "DigiDinez API is running",
  "timestamp": "2024-01-15T15:00:00.000Z",
  "environment": "development",
  "database": {
    "status": "connected",
    "connected": true,
    "name": "digidinez"
  },
  "features": {
    "authentication": "enabled",
    "cookieParser": "enabled"
  },
  "version": "1.0.0"
}
```

---

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "entity": { ... }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (development only)"
}
```

---

## Error Handling

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **422 Unprocessable Entity**: Validation failed
- **500 Internal Server Error**: Server error

### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email"
    }
  ]
}
```

---

## Data Models

### Restaurant Model
```javascript
{
  name: String (required, max 100 chars),
  email: String (required, unique, lowercase),
  password: String (required, min 6 chars),
  phone: String (required, unique, Indian format),
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String (6 digits),
    country: String (default: "India")
  },
  isActive: Boolean (default: true),
  qrCodeUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### MenuItem Model
```javascript
{
  name: String (required, max 100 chars),
  description: String (max 500 chars),
  price: Number (required, min 0),
  restaurantId: ObjectId (ref: Restaurant),
  categoryIds: [ObjectId] (ref: MenuCategory),
  tagIds: [ObjectId] (ref: Tag),
  image: {
    filename: String,
    path: String,
    size: Number,
    mimetype: String,
    uploadedAt: Date
  },
  isAvailable: Boolean (default: true),
  isVeg: Boolean (default: true),
  isSpicy: Boolean (default: false),
  spicyLevel: Number (0-3, default: 0),
  preparationTime: Number (1-180 minutes),
  nutritionInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  allergens: [String] (enum values),
  sortOrder: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### MenuCategory Model
```javascript
{
  name: String (required, max 50 chars),
  restaurantId: ObjectId (ref: Restaurant),
  sortOrder: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Tag Model
```javascript
{
  name: String (required, max 30 chars),
  color: String (hex color),
  restaurantId: ObjectId (ref: Restaurant),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Authentication

### JWT Token Structure
```javascript
{
  id: "restaurant_id",
  email: "restaurant_email",
  name: "restaurant_name",
  iat: "issued_at_timestamp",
  exp: "expiration_timestamp"
}
```

### Cookie Configuration
- **Name**: `authToken`
- **Expires**: 7 days
- **HttpOnly**: true
- **Secure**: true (production)
- **SameSite**: strict

---

## File Upload

### Supported Image Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### File Size Limits
- Maximum: 5MB per image

### Storage Locations
- Menu item images: `/uploads/`
- QR codes: `/qr-codes/`

---

## Development Notes

### Test Restaurant Account
- **Email**: admin@pizzahut.com
- **Password**: coldcold

### Environment Variables
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/digidinez
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

### CORS Configuration
- All origins allowed in development
- Credentials enabled
- Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Headers: Content-Type, Authorization 
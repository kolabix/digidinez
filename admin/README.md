# DigiDinez Admin App

A React-based admin dashboard for restaurant owners to manage their digital menus and QR codes.

## Features

- **Authentication**: Secure login/register system
- **Menu Management**: Create and manage menu categories, items, and tags
- **QR Code Management**: Generate and manage QR codes for digital menu access
- **Profile Management**: Update restaurant information
- **Responsive Design**: Works on desktop and mobile devices

## QR Code Functionality

The QR code feature allows restaurant owners to:

1. **Generate QR Codes**: Create unique QR codes that link to their digital menu
2. **View QR Code Details**: See generation date, file size, and public URL
3. **Copy Public URL**: Easily copy the QR code URL for sharing
4. **Regenerate QR Codes**: Create new QR codes when needed
5. **Delete QR Codes**: Remove existing QR codes

### How QR Codes Work

1. Restaurant owners generate a QR code from the admin dashboard
2. The QR code contains a URL that points to their public digital menu
3. Customers can scan the QR code with their phone camera
4. They're taken directly to the restaurant's digital menu

### QR Code Management

- **Generate**: Creates a new QR code for the restaurant
- **View**: Displays the QR code image and details
- **Copy URL**: Copies the public URL to clipboard
- **Regenerate**: Creates a new QR code (replaces the old one)
- **Delete**: Removes the QR code completely

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp env.example .env
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Access the admin app at `http://localhost:4000`

## API Integration

The app connects to the DigiDinez backend API for:
- Authentication and user management
- Menu data management
- QR code generation and management

Make sure the backend server is running on port 3001 before using the admin app.

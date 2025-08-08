# DigiDinez Admin

Admin dashboard for DigiDinez - a restaurant menu digitization platform.

## Features

- Restaurant profile management
- Menu item management with categories and tags
- Image upload and management
- QR code generation for public menu access
- Authentication and authorization

## Tech Stack

- **React 19** with JSX
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Router** for navigation

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
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Access the admin dashboard**:
   - Development: `http://localhost:5173`
   - Login with your restaurant credentials

## API Integration

The admin app communicates with the DigiDinez backend API:

- **Base URL**: Configured via `VITE_API_BASE_URL` environment variable
- **Authentication**: Cookie-based JWT authentication
- **CORS**: Configured for localhost development

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3001/api` |

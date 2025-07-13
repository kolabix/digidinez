# 🍽️ DigiDinez

DigiDinez is a full-stack web application that enables restaurants to digitize their menus via QR codes. Restaurant owners can log in, manage their digital menu, and generate a live QR code that customers can scan to view the menu on their phones — no app required.

## 🧱 Tech Stack

- **Frontend**: React 18 (Vite) + Tailwind CSS
- **Backend**: Node.js 22 + Express
- **Database**: MongoDB (Mongoose)
- **QR Code Generation**: `qrcode` npm package
- **Authentication**: JWT-based with bcrypt password hashing
- **Image Uploads**: Local file system for MVP

## 📁 Project Structure

```
digidinez/
├── backend/                    # Express backend API
│   ├── controllers/            # Business logic for routes
│   ├── models/                 # Mongoose schemas (Restaurant, MenuItem)
│   ├── routes/                 # Express route definitions
│   ├── middleware/             # Auth middleware, error handling
│   ├── utils/                  # QR code generation, file uploads
│   ├── config/                 # DB and environment config
│   └── server.js               # Express server entry point
│
├── frontend/                   # React frontend
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
```

## 🚀 Quick Start

### Prerequisites

- Node.js 22.17.0 (LTS)
- MongoDB (local installation or MongoDB Atlas)

### Setup

1. **Clone and Setup Environment**
   ```bash
   git clone <repository-url>
   cd digidinez
   
   # Copy environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Frontend Setup** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Database Setup**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in `backend/.env`

## 🔧 API Endpoints

- `POST /api/auth/register` - Restaurant registration
- `POST /api/auth/login` - Restaurant login
- `GET /api/menu/:restaurantId` - Get public menu
- `POST /api/menu/items` - Add menu item (authenticated)
- `PUT /api/menu/items/:id` - Update menu item (authenticated)
- `DELETE /api/menu/items/:id` - Delete menu item (authenticated)
- `GET /api/qr/:restaurantId` - Generate QR code

## 🎯 Features

- [x] Restaurant authentication (JWT)
- [x] Menu management (CRUD operations)
- [x] QR code generation
- [x] Public menu view
- [ ] Image uploads for menu items
- [ ] Menu categories
- [ ] Restaurant customization
- [ ] Analytics dashboard

## 🛠️ Development

### Available Scripts

**Backend:**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Environment Variables

**Backend (`backend/.env`):**
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration time

**Frontend (`frontend/.env`):**
- `VITE_API_URL` - Backend API URL

## 📱 Usage

1. Restaurant owners register/login
2. Add menu items with descriptions and prices
3. Generate QR code for their restaurant
4. Customers scan QR code to view live menu
5. No app download required for customers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

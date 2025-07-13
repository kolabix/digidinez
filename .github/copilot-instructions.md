# Copilot Instructions for DigiDinez

## 🔧 Project Overview
DigiDinez is a full-stack web application that enables restaurants to digitize their menus via QR codes. Restaurant owners can log in, manage their digital menu, and generate a live QR code that customers can scan to view the menu on their phones — no app required.

## 🧱 Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **QR Code Generation**: `qrcode` npm package
- **Authentication**: JWT-based with bcrypt password hashing
- **Image Uploads**: Local file system for MVP (can switch to S3/Cloudinary later)
- **Environment**: Local development (no Docker yet)

## 📁 Folder Structure

<pre>
digidinez/
├── backend/                    # Express backend API
│   ├── controllers/            # Business logic for routes
│   ├── models/                 # Mongoose schemas (e.g., Restaurant, MenuItem)
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
</pre>

## ✅ Conventions

- Use **Express Router** and `async/await` in all backend routes.
- Use **Mongoose models** per entity (e.g., `Restaurant.js`, `MenuItem.js`).
- API routes are prefixed with `/api`, for example:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/menu/:restaurantId`
- All APIs return JSON responses.
- JWT tokens are sent/stored in **HTTP-only cookies**.
- Use `axios` for all frontend API calls.
- Tailwind CSS should be used for all UI styling.

## 💻 Common Local Commands

```bash
# Start backend
cd backend
npm install
npm run dev

# Start frontend
cd frontend
npm install
npm run dev
```

## 📦 External Dependencies

**Backend:**

- express
- mongoose
- dotenv
- cors
- bcryptjs
- jsonwebtoken
- qrcode
- multer

**Frontend:**

- axios
- react-router-dom
- tailwindcss
- clsx (optional)

---

✏️ **Keep this file updated** as new conventions, routes, models, or utilities are added. GitHub Copilot will use this to generate better and more consistent code suggestions.

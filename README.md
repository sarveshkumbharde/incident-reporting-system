🚀 Features
👤 User Features

Sign up & Login with JWT Auth

Report incidents with image upload (via Cloudinary)

View their reported incidents

Submit feedback on assigned/resolved incidents

Receive notifications when:

Incident is assigned

Status is updated

Edit profile & change password

🛡️ Authority Features

View only assigned incidents

Update incident status

Send feedback

Receive notifications when assigned incidents

🔑 Admin Features

Manage all users (verify, approve, reject)

View all incidents

Assign incidents to authorities

Receive notifications when new incident is reported

Remove users

Monitor system activity

📬 Notifications

Stored per-user

Supports Mark as Read, Mark All Read, Clear All

Bell icon shows unread count

Each notification includes "View Incident" link

📸 Cloudinary Integration

Stores:

Profile pictures

Aadhaar card

Incident images

🔐 Authentication

JWT stored in HTTP-only cookies

Role-based routing (Admin / Authority / User)

Auto-login using /auth/me

🛠️ Tech Stack
Frontend

React.js (Vite)

Zustand (Global Store)

React Router

DaisyUI + Tailwind CSS

Axios

React Hot Toast

Backend

Node.js

Express.js

MongoDB + Mongoose

JWT Authentication

Cloudinary Storage

Multer (file upload)

CORS, Cookie-Parser

📂 Folder Structure

/project-root
│
├── backend
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── config/
│   ├── uploads/  (Unused in latest version)
│   └── server.js
│
└── frontend
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── stores/
    │   ├── utils/
    │   └── App.jsx
    └── vite.config.js

⚙️ Environment Variables
Backend .env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173

▶️ Installation & Setup
git clone https://github.com/your-username/incident-reporter.git
cd incident-reporter

2️⃣ Install backend dependencies
cd backend
npm install

3️⃣ Install frontend dependencies
cd ../frontend
npm install

4️⃣ Run backend
npm start

5️⃣ Run frontend
npm run dev

🔐 Default Routes Overview
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/report-incident
GET    /api/auth/notifications
POST   /api/auth/submit-feedback

Admin Routes
GET    /api/admin/registrations
POST   /api/admin/verify-user
POST   /api/admin/assign-incident
GET    /api/admin/users

Authority Routes
GET    /api/authority/incidents
POST   /api/authority/update-status


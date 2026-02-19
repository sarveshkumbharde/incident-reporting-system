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

“This is a role-based Incident Reporting and Management System built using the MERN stack.
The main goal was to design a transparent workflow where incidents can be reported, reviewed, assigned, and resolved with clear accountability.

Users can report incidents and track their progress.
Admins manage user verification and assign incidents to the appropriate authorities.
Authorities handle the incident, update its status, and communicate through feedback.

On the backend, I use MongoDB with two core models.
The User model stores identity details, role, approval status, notifications, and references to reported or assigned incidents.
The Incident model stores incident-specific data such as images, severity, current status, reporter, assigned authority, and a feedback thread.

Authentication is handled using JWT with HTTP-only cookies, and role-based authorization is enforced through middleware, so each role can only access the actions relevant to them.

For user experience, the frontend updates dynamically without page reloads by re-fetching incident data after every action, keeping the backend as the single source of truth.

I also implemented real-time notifications using Socket.IO.
If a user is online, they receive notifications instantly.
If they’re offline, the notification is persisted and sent via email to ensure no updates are missed.”
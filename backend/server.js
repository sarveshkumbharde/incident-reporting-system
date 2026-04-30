const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const connectDB = require('./config/db.js');
const bodyParser = require('body-parser')
const app = express();
const path = require("path");
const mongoose = require("mongoose")

const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/auth.routes.js')
const authorityRoutes = require('./routes/authority.routes.js')
const adminRoutes = require('./routes/admin.routes.js')

console.log("✅ Admin routes mounted at /api/admin");

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

global.io = io;

// make io available everywhere
app.set("io", io);

require("./workers/notification.worker.js");
console.log("[BullMQ][Notifications] Worker registered with server process");

require("./workers/email.worker.js");
console.log("[BullMQ][Email] Worker registered with server process");

 const {socketHandler} = require('./sockets/index.js');
 socketHandler(io);


// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  }));
  
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());
app.use(cookieParser());


// Database Connection
connectDB()

app.use('/api/auth', authRoutes);
app.use('/api/authority', authorityRoutes);
app.use('/api/admin', adminRoutes);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
    console.log("Shutting down server...");
    await mongoose.disconnect();
    process.exit(0);
});

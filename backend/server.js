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
    origin: 'http://localhost:5173',
    credentials: true
  }
});

// make io available everywhere
app.set("io", io);

 const {socketHandler} = require('./sockets/index.js');
 socketHandler(io);


// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
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
